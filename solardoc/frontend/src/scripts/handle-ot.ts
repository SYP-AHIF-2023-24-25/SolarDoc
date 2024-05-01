import { useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import type { OTransReqDto, OTransRespDto } from '@/services/phoenix/ot-trans'

let enabled = false
const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

async function handleIncomingUpdate(toProcess: OTransRespDto): Promise<void> {
  currentFileStore.pushOTransResp(toProcess)
}

export async function handleOutgoingUpdate(toSend: OTransReqDto): Promise<void> {
  currentFileStore.pushOTransReq(toSend)
  await editorUpdateWSClient.wsClient?.sendOTrans(
    toSend,
    () => console.log('[handle-ot.ts] Successfully sent OT request to remote'),
    resp =>
      console.error(`[handle-ot.ts] Received error response in response to OT request: ${resp}`),
  )
}

/**
 * Starts the process which will handle the incoming and outgoing OT updates.
 * @since 0.5.0
 */
export function handleOTUpdates() {
  if (enabled) {
    return
  }

  editorUpdateWSClient.wsClient?.listenForOTrans(handleIncomingUpdate)
  enabled = true
}
