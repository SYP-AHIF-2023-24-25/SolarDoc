import { SDSCLIENT_URL } from '@/services/phoenix/config'
import { showWarnNotif } from '@/scripts/show-notif'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

/**
 * Connect to the SDS WebSocket if the user is logged in and has the necessary permissions. If there is already a
 * connection present, this functions simply returns true.
 *
 * If this returns true, establishing a connection a channel should be possible without any issues.
 * @returns True if the connection was successful, false otherwise.
 * @since 0.7.0
 */
export async function connectToWSIfPossible(): Promise<boolean> {
  if (editorUpdateWSClient.wsClient) {
    return true
  }

  const authStatus = await currentUserStore.ensureAuthNotExpiredOrRevoked()
  if (currentUserStore.loggedIn || authStatus === 'authenticated') {
    // Ensure that the user has the permissions to open the current files
    await currentFileStore.ensureUserIsAuthorisedForFile(currentUserStore.currentUser!.id)

    console.log('[Editor] Attempting to connect to SDS')
    editorUpdateWSClient.createWSClient(SDSCLIENT_URL, currentUserStore.currentAuth!.token)
    return true
  } else if (authStatus === 'expired-or-revoked') {
    await currentUserStore.logout()
    await currentFileStore.closeFile()
  } else if (authStatus === 'unreachable' || authStatus === 'unknown') {
    showWarnNotif('Warning', 'Could not verify authentication status. Please reload the page.')
  } else {
    console.log('[Editor] Skipping connection to SDS. Not logged in!')
  }
  return false
}
