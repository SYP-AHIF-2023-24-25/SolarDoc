import type { CreateEditorChannel, EditorChannel } from '@/services/phoenix/editor-channel'
import { useCurrentUserStore } from '@/stores/current-user'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentFileStore } from '@/stores/current-file'
import { PhoenixNotAuthorisedError, PhoenixSDSError } from '@/services/phoenix/errors'

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

/**
 * Create a new channel for the current user.
 * @param data The data to create the channel with.
 * @returns A promise that resolves when the channel is created and has been joined.
 * @since 0.7.0
 */
export function createChannel(data: CreateEditorChannel): Promise<EditorChannel> {
  if (!currentUserStore.loggedIn || !currentUserStore.bearer) {
    throw new PhoenixNotAuthorisedError('User is not logged in.', 'Please log in and try again.')
  } else if (!editorUpdateWSClient.wsClient || !editorUpdateWSClient.wsClient.healthy) {
    throw new PhoenixSDSError(
      'Websocket client is not active or healthy. Can not join channel!',
      'Please reload page and try again later. If the problem persists, contact the developers.',
    )
  }

  return new Promise<EditorChannel>((resolve, reject) => {
    void editorUpdateWSClient.wsClient!.createChannel(
      async channel => {
        console.log('[ChannelView] Channel created', channel)
        resolve(channel)
      },
      errorResp => {
        console.error('[ChannelView] Failed to create new channel', errorResp)
        reject(
          new PhoenixSDSError(
            'Failed to create new channel',
            'Please try again. If the problem persists, check the logs and contact the developers.',
          ),
        )
      },
      data,
      currentFileStore.content,
      currentUserStore.currentUser!.id,
    )
  })
}
