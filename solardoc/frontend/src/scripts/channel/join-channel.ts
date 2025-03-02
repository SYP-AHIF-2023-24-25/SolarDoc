import type { EditorChannel, JoinChannelOptions } from '@/services/phoenix/editor-channel'
import { PhoenixSDSError } from '@/services/phoenix/errors'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentFileStore } from '@/stores/current-file'
import { OTManager, type OTransRespDto } from '@/services/phoenix/ot-trans'
import type { File } from '@/services/phoenix/gen/phoenix-rest-service'
import { useCurrentUserStore } from '@/stores/current-user'

const editorUpdateWSClient = useEditorUpdateWSClient()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()

/**
 * Join a channel to receive updates for a specific document from the server.
 * @param channel The channel to join.
 * @param password The password to join the channel with.
 * @returns A promise that resolves when the channel is joined.
 * @since 0.7.0
 */
export function joinChannel(channel: EditorChannel, password?: string): Promise<void> {
  if (!editorUpdateWSClient.wsClient || !editorUpdateWSClient.wsClient.healthy) {
    throw new PhoenixSDSError(
      'Websocket client is not active or healthy. Can not join channel!',
      'Please reload page and try again later. If the problem persists, contact the developers.',
    )
  }

  return new Promise<void>((resolve, reject) => {
    void editorUpdateWSClient.wsClient?.joinChannel(
      `channel:${channel.id}`,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (initTrans: OTransRespDto, file: Required<File>) => {
        console.log(`[ChannelView] Channel joined (Id: ${channel.id})`)
        currentFileStore.setFile(file)
        editorUpdateWSClient.setCurrentChannel(channel)
        await currentFileStore.initOTransStackFromServerTrans(initTrans)

        // Start the OT update handler
        const listenPromise = OTManager.listenForUpdates()
        if (!listenPromise) {
          throw new PhoenixSDSError(
            'Failed to start OT update handler',
            'Please reload the page and try again later. If the problem persists, contact the developers.',
          )
        }
        await listenPromise
        resolve()
      },
      errorResp => {
        console.error('[ChannelView] Error joining channel:', errorResp)
        reject(
          new PhoenixSDSError(
            'Error joining channel',
            'Please try again later. If the problem persists, contact the developers.',
          ),
        )
      },
      currentUserStore.currentUser!.id,
      { auth: password || '' } satisfies JoinChannelOptions,
    )
  })
}
