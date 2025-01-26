import type {
  CreateFilePermissions,
  File,
  FilePermission,
  ShareUrl,
} from '@/services/phoenix/gen/phoenix-rest-service'
import type { Awaited } from '@vueuse/core'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { PhoenixInternalError } from '@/services/phoenix/errors'
import { showWarnNotif } from '@/scripts/show-notif'
import type { Permission } from '@/stores/current-file'
import { useCurrentFileStore } from '@/stores/current-file'
import { useCurrentUserStore } from '@/stores/current-user'
import type { Router } from 'vue-router'
import { throw404Error } from '@/router/404-err'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()

async function getFile($router: Router, shareUrlId: string): Promise<File | undefined> {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2ShareByIdFile>>
  try {
    resp = await phoenixRestService.getV2ShareByIdFile(currentUserStore.bearer!, shareUrlId)
  } catch (e) {
    throw new PhoenixInternalError('Critically failed to fetch file. Cause: ' + (<Error>e).message)
  }

  if (resp.status !== 200) {
    await throw404Error($router)
    return undefined
  }
  return resp.data
}

async function getShareURL($router: Router, shareUrlId: string): Promise<ShareUrl | undefined> {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2ShareById>>
  try {
    resp = await phoenixRestService.getV2ShareById(currentUserStore.bearer!, shareUrlId)
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch share URL. Cause: ' + (<Error>e).message,
    )
  }

  if (resp.status !== 200) {
    await throw404Error($router)
    return undefined
  }
  return resp.data
}

async function getFilePermissionsForUser(
  $router: Router,
  file: File,
  permissionsFromUrl: number,
): Promise<number> {
  const perm: FilePermission | undefined = await getFilePermissionsForCurrentUser(file)
  if (perm !== undefined) {
    return perm.permission
  }
  await createFilePermission($router, file, permissionsFromUrl)
  return permissionsFromUrl
}

async function createFilePermission($router: Router, file: File, permissionsFromUrl: number) {
  try {
    const createFilePermissions: CreateFilePermissions = {
      permission: permissionsFromUrl,
      file_id: file.id,
      user_id: currentUserStore.currentUser?.id!,
    }
    await phoenixRestService.postV2FilesPermissions(currentUserStore.bearer!, createFilePermissions)
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to create permissions entry. Cause: ' + (<Error>e).message,
    )
  }
}

async function getFilePermissionsForCurrentUser(file: File): Promise<FilePermission | undefined> {
  let currentUserFilePermissions: Awaited<
    ReturnType<typeof phoenixRestService.getV2FilesByFileIdPermissionsAndUserId>
  >
  try {
    currentUserFilePermissions = await phoenixRestService.getV2FilesByFileIdPermissionsAndUserId(
      currentUserStore.bearer!,
      file.id,
      currentUserStore.currentUser?.id!,
    )
    if (currentUserFilePermissions.status === 404) {
      return undefined
    }
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch file permission. Cause: ' + (<Error>e).message,
    )
  }
  return <FilePermission>currentUserFilePermissions.data
}

/**
 * Handles a share URL and initializes the editor based on the share URL.
 * @param $router The router object.
 * @param shareUrlId The share URL ID.
 * @returns True if the file was successfully initialized, false otherwise (indicates an error or redirect to login).
 * @since 1.0.0
 */
export async function initEditorFileBasedOnShareURL(
  $router: Router,
  shareUrlId: string,
): Promise<boolean> {
  if (!shareUrlId) {
    await $router.isReady()
    await $router.push('/404')
    return false
  } else if (!currentUserStore.loggedIn) {
    loadingStore.setLoading(false)
    await $router.push({ path: '/login', query: { returnTo: $router.currentRoute.value.fullPath } })
    showWarnNotif(
      'Not logged in',
      'You need to be logged in to view this file. Please log in first and try again.',
    )
    return false
  }

  const file = await getFile($router, shareUrlId)
  if (!file) {
    return false
  }
  const shareURL = await getShareURL($router, shareUrlId)
  if (!shareURL) {
    return false
  }

  // The owner themselves can use the share URL so we need to make sure they see it as it were their own file
  const isShareFileOwner = currentUserStore.currentUser?.id === file.owner_id
  if (isShareFileOwner) {
    await $router.isReady()
    await $router
      .replace({ path: `/editor/o/${file.id}`, force: true, query: { showIsOwnerWarn: 'true' } })
      .then(() => {
        $router.go(0) // Reload the page to ensure the file is loaded, due to a bug this is necessary
      })
    return false
  }
  const permissions = await getFilePermissionsForUser($router, file, shareURL.perms)
  currentFileStore.setFileFromShared(file, shareUrlId, <Permission>permissions)
  return true
}
