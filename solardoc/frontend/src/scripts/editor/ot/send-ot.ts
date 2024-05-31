import type {OTransReqDto} from '@/services/phoenix/ot-trans'
import {handleOutgoingUpdate} from '@/services/phoenix/ot-trans'

/**
 * Sends the operational transformation updates to the server.
 * @param ots The operational transformation updates to send.
 * @param hasChannelConnection Whether the user has a channel connection. This determines whether we should send the
 * updates to the server.
 * @since 0.7.0
 */
export async function sendOTUpdates(
  ots: Array<OTransReqDto>,
  hasChannelConnection: boolean = false,
): Promise<void> {
  for (const oTrans of ots) {
    console.debug(`[Editor] Pushing OT operation:`, oTrans)
    await handleOutgoingUpdate(oTrans, hasChannelConnection)
  }
}
