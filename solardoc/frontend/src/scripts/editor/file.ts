import { useCurrentFileStore } from '@/stores/current-file'
import { useCurrentUserStore } from '@/stores/current-user'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { connectToWSIfPossible } from '@/scripts/editor/sds'
import { createOrJoinChannelForFile } from '@/scripts/editor/channel'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const editorUpdateWSClient = useEditorUpdateWSClient()
const overlayStateStore = useOverlayStateStore()

/**
 * Close the current remote file connection and resets all file-related stores.
 * @returns True if the connection was closed, false otherwise. (e.g. no connection was present)
 * @since 0.7.0
 */
export async function closeEditorRemoteFileConnection(): Promise<boolean> {
  if (!editorUpdateWSClient.wsClient) {
    return false
  }
  overlayStateStore.resetAll()
  await currentFileStore.closeFile()
  editorUpdateWSClient.resetCurrentChannel()
  editorUpdateWSClient.disconnectWSClient()
  return true
}

/**
 * Create a new remote file connection and populates the channel store.
 * @returns True if the connection was successful, false otherwise. (e.g. no file or user is present which is required
 * for the connection)
 * @since 0.7.0
 */
export async function createEditorRemoteFileConnection(): Promise<boolean> {
  overlayStateStore.resetAll()
  const sdsConnected = await connectToWSIfPossible()
  if (
    sdsConnected &&
    currentFileStore.remoteFile &&
    currentFileStore.raw &&
    currentUserStore.currentUser
  ) {
    await currentFileStore.fetchNewestRemoteFileVersionIfPossible(currentUserStore.bearer!)
    await createOrJoinChannelForFile(
      currentFileStore.raw,
      currentUserStore.bearer!,
      currentFileStore.shareURLId,
    )
    return true
  } else {
    return false
  }
}
