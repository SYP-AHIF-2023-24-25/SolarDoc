import { useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * A raw operational transformation which inserts text.
 */
export interface RawInsertOTrans {
  readonly type: 'insert'
  readonly pos: number
  readonly content: string
}

/**
 * A raw operational transformation which deletes text.
 */
export interface RawDeleteOTrans {
  readonly type: 'delete'
  readonly pos: number
  readonly length: number
}

/**
 * A raw operational transformation.
 */
export type RawOTrans = RawInsertOTrans | RawDeleteOTrans

/**
 * A DTO for an operational transformation transaction request.
 *
 * This will be sent to the server and then returned as a full transaction in form of {@link OTransRespDTO}.
 */
export interface OTransReqDto {
  id: string
  trans: RawOTrans
}

/**
 * A DTO for an operational transformation transaction response.
 *
 * This will be sent to the client and then stored in the local database.
 */
export interface OTransRespDto {
  id: string
  trans: RawOTrans
  timestamp: number
  user_id: string
}

/**
 * An operational transformation transaction.
 * @since 0.5.0
 */
export interface OTrans {
  id: string
  trans: RawOTrans
  timestamp: number | undefined
  user_id: string
  acknowledged: boolean
  init: boolean
}

const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

async function handleIncomingUpdate(toProcess: OTransRespDto): Promise<void> {
  await currentFileStore.pushOTransResp(toProcess)
}

export async function handleOutgoingUpdate(
  toSend: OTransReqDto,
  sendToRemote: boolean = false,
): Promise<void> {
  await currentFileStore.pushOTransReq(toSend)
  if (sendToRemote) {
    await editorUpdateWSClient.wsClient?.sendOTrans(toSend, (resp: any) => {
      console.error(`[handle-ot.ts] Received error response in response to OT request: ${resp}`)
    })
  }
}

/**
 * Starts the process which will handle the incoming and outgoing OT updates. If the listener was already set up, this
 * function will do nothing.
 *
 * If the WebSocket client is not connected, this function will do nothing.
 * @since 0.5.0
 */
export function handleOTUpdates() {
  editorUpdateWSClient.wsClient?.listenForOTrans(handleIncomingUpdate)
}

/**
 * Creates an OTrans object which represents a change to the content.
 * @param insertOrDeleteTrans The raw insert or delete OTrans.
 * @returns The OTrans object.
 * @since 0.7.0
 */
function createOTrans(insertOrDeleteTrans: RawInsertOTrans | RawDeleteOTrans): OTransReqDto {
  return {
    id: uuidv4(),
    trans: insertOrDeleteTrans,
  }
}

/**
 * Creates an OTrans object which represents a deletion of text.
 * @param pos The position at which the text should be deleted.
 * @param length The length of the text to delete.
 */
export function createDeleteOTrans(pos: number, length: number): OTransReqDto {
  return createOTrans({ type: 'delete', pos, length })
}

export function createInsertOTrans(pos: number, content: string): OTransReqDto {
  return createOTrans({ type: 'insert', pos, content })
}
