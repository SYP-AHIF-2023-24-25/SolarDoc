import {useCurrentFileStore} from "@/stores/current-file";
import {UpdateCycleHandler} from "@/services/phoenix/update-cycle-handler";
import type {OTransReqDto, OTransRespDto} from "@/services/phoenix/ot-trans";
import {useEditorUpdateWSClient} from "@/stores/editor-update-ws-client";

const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()
const updateCycleHandler = new UpdateCycleHandler(handleIncomingUpdate, handleOutgoingUpdate)

async function handleIncomingUpdate(received: OTransRespDto): Promise<void> {
  // We will apply the transformation to the document
  currentFileStore.pushOTransResp(received)
}

async function handleOutgoingUpdate(toSend: OTransReqDto): Promise<void> {
  await editorUpdateWSClient.wsClient?.sendOTrans(
    toSend,
    () => console.log("[handle-ot.ts] Successfully sent OT request to remote"),
    resp => console.error(`[handle-ot.ts] Received error response in response to OT request: ${resp}`),
  )
}

/**
 * Starts the process which will handle the incoming and outgoing OT updates.
 * @since 0.5.0
 */
export function handleOTUpdates() {
  if (updateCycleHandler.running) {
    return
  }

  updateCycleHandler.start()
  editorUpdateWSClient.wsClient?.listenForOTrans(oTransResp => {
    currentFileStore.pushOTransResp(oTransResp)
  })
}
