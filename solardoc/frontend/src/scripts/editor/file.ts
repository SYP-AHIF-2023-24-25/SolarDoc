import { useCurrentFileStore } from '@/stores/current-file'
import { useCurrentUserStore } from '@/stores/current-user'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { connectToWSIfPossible } from '@/scripts/editor/sds'
import { createOrJoinChannelForFile } from '@/scripts/editor/channel'
import { useLoadingStore } from '@/stores/loading'
import { useRenderDataStore } from '@/stores/render-data'
import type { File } from '@/services/phoenix/gen/phoenix-rest-service'
import type { LocationQuery, RouteParams, Router } from 'vue-router'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { SolardocUnreachableError } from '@/errors/unreachable-error'
import { KipperFileNotFoundError } from '@/errors/file-not-found-error'
import { showSuccessNotifFromObj, showWarnNotifFromObj } from '@/scripts/show-notif'
import constants from '@/plugins/constants'
import { initEditorFileBasedOnShareURL } from '@/scripts/share/resolve-share-url'
import { omitQuery } from '@/router/omit-query'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const editorUpdateWSClient = useEditorUpdateWSClient()
const loadingStore = useLoadingStore()
const renderDataStore = useRenderDataStore()
const previewLoadingStore = usePreviewLoadingStore()
const overlayStateStore = useOverlayStateStore()
const initStateStore = useInitStateStore()

/**
 * Initializes the editor file based on the provided path arguments and appropriately sets up any
 * requirements for any eventual connection with the server.
 * @param $router The router object which is used to modify
 * @param routeName The route name.
 * @param routeParams The params of the route.
 * @param routeQueries The queries of the route.
 * @since 1.0.0
 */
export async function initEditorFileBasedOnPath(
  $router: Router,
  routeName: string,
  routeParams: RouteParams,
  routeQueries: LocationQuery,
): Promise<'local' | ['remote', string] | ['shared', string]> {
  if ('showFileGoneError' in routeQueries && routeQueries.showFileGoneError === 'true') {
    await omitQuery($router, { queryKey: 'showFileGoneError' })
    showSuccessNotifFromObj(constants.notifMessages.fileGone)
  } else if ('showIsOwnerWarn' in routeQueries && routeQueries.showIsOwnerWarn === 'true') {
    await omitQuery($router, { queryKey: 'showIsOwnerWarn' })
    showWarnNotifFromObj(constants.notifMessages.sharedFileIsOwnedByYou)
  }

  if (routeName === 'local-editor') {
    if ('new' in routeQueries && routeQueries.new === 'true') {
      currentFileStore.setFileToDefaultState()

      // We need to avoid the user reloading the page and accidentally clearing his state so we need to clean up the
      // path query and ensure that the reload is without side effects
      $router.replace({ name: 'local-editor' }).then(() => {
        showSuccessNotifFromObj(constants.notifMessages.newFile)
      })
    } else {
      currentFileStore.setFileFromLocalStorage()
    }
    return 'local'
  }

  let type: 'remote' | 'shared' = 'remote'
  const id = <string>routeParams['fileId']
  if (routeName === 'remote-editor') {
    try {
      await currentFileStore.setFileWithRemoteId(id, currentUserStore.bearer!)
    } catch (e) {
      if (e instanceof KipperFileNotFoundError) {
        await $router.push({ name: 'local-editor', query: { showFileGoneError: 'true' } })
      }
    }
  } else {
    const success = await initEditorFileBasedOnShareURL($router, `${routeParams.fileId}`)
    if (!success) {
      // -> Indicates error or redirect
      return 'local' // -> Redirect to local editor, temporary white screen before the actual load is performed
    }
    type = 'shared'
    showSuccessNotifFromObj(constants.notifMessages.successfullyOpenedSharedFile)
  }

  await phoenixBackend.ensurePhoenixBackendIsReachable()
  await createEditorRemoteFileConnection()
  return [type, id]
}

/**
 * Opens a file in the editor.
 * @param $router The router to use to redirect to the editor.
 * @param file The file to open up.
 * @since 1.0.0
 */
export async function openFileInEditor($router: Router, file: File): Promise<void> {
  loadingStore.setLoading(true)
  renderDataStore.clear()
  initStateStore.setInit(true)
  previewLoadingStore.setPreviewLoading(false)

  await closeEditorRemoteFileConnection()
  await currentFileStore.closeFileGlobally({ emptyContent: true })
  await $router.push(`/editor/o/${file.id}`)
}

/**
 * Close the current remote file connection and resets all file-related stores.
 *
 * If there was no websocket connection, we will still reset the file store just to be safe.
 * @returns True if the connection was closed, false otherwise. (e.g. no connection was present)
 * @since 0.7.0
 */
export async function closeEditorRemoteFileConnection(): Promise<boolean> {
  overlayStateStore.resetAll()
  await currentFileStore.closeFileGlobally()
  if (editorUpdateWSClient.wsClient) {
    await editorUpdateWSClient.disconnectWSClient()
    return true
  }
  return false
}

/**
 * Create a new remote file connection and populates the channel store.
 * @since 0.7.0
 */
export async function createEditorRemoteFileConnection(): Promise<void> {
  overlayStateStore.resetAll()
  const sdsConnected = await connectToWSIfPossible()
  if (!sdsConnected) {
    throw new SolardocUnreachableError('Failed to establish connection to the remote SDS server')
  }
  await createOrJoinChannelForFile(
    <File>currentFileStore.raw, // Since this is a remote file we know it's not a LocalFile
    currentUserStore.bearer!,
    currentFileStore.shareURLId,
  )
}
