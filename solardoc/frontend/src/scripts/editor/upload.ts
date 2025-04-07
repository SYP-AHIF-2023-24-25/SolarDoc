import type { Router } from 'vue-router'
import constants from '@/plugins/constants'
import { interceptErrors } from '@/errors/handler/error-handler'
import { ensureLoggedIn } from '@/scripts/ensure-logged-in'
import { showInfoNotifFromObj } from '@/scripts/show-notif'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { createEditorRemoteFileConnection } from '@/scripts/editor/file'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { useLoadingStore } from '@/stores/loading'

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const loadingStore = useLoadingStore()

/**
 * Uploads or saves a file with the current content of the editor.
 *
 * Uses the data from the current user and file store to automatically perform the correct action.
 * @since 1.0.0
 */
export async function uploadOrSaveFile($router: Router): Promise<void> {
  // Indicates whether this is a new file or an existing file
  const wasAlreadyUploaded = !!currentFileStore.fileId

  loadingStore.lockLoading()
  loadingStore.pushMsg(
    wasAlreadyUploaded
      ? constants.loadingMessages.savingFileName
      : constants.loadingMessages.uploadingFile,
  )
  try {
    await interceptErrors(
      ensureLoggedIn($router).then(
        async () => await currentFileStore.storeOnServer(currentUserStore.bearer!),
      ),
    )
    if (wasAlreadyUploaded) {
      showInfoNotifFromObj(constants.notifMessages.fileSaved)
      loadingStore.popMsg(constants.loadingMessages.savingFileName)
    } else {
      // Set the path to the editor for remote files (won't cause a real reload but simply change the path)
      await $router.push({
        name: 'remote-editor',
        params: { fileId: currentFileStore.fileId },
      })

      showInfoNotifFromObj(constants.notifMessages.fileUploaded)
      loadingStore.popMsg(constants.loadingMessages.uploadingFile)
      loadingStore.pushMsg(constants.loadingMessages.loadingEditor)

      // Ensure the phoenix backend is reachable and create a connection to the remote SDS server
      await phoenixBackend.ensurePhoenixBackendIsReachable()
      await createEditorRemoteFileConnection()

      loadingStore.popMsg(constants.loadingMessages.loadingEditor)
    }
  } catch (e) {
    loadingStore.unlockLoading()
    throw e
  }
  loadingStore.unlockLoading()
}
