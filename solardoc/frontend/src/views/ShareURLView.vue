<script lang="ts" setup>
import ProgressSpinner from '@/components/common/ProgressSpinner.vue'
import { type Permission, useCurrentFileStore } from '@/stores/current-file'
import {
  type File,
  type ShareUrl,
  type CreateFilePermissions,
  type FilePermission,
} from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { PhoenixInternalError } from '@/services/phoenix/errors'
import { useLoadingStore } from '@/stores/loading'
import { useRoute, useRouter } from 'vue-router'
import { showWarnNotif } from '@/scripts/show-notif'
import { interceptErrors } from '@/errors/handler/error-handler'
import type { Awaited } from '@vueuse/core'
import { useContributorsStore } from '@/stores/contributors'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const loadingStore = useLoadingStore()
const contributorsStore = useContributorsStore()

const $route = useRoute()
const $router = useRouter()

loadingStore.setLoading(true)

function throw404Error(): Promise<any> {
  return $router.push('/404')
}

async function getFile(shareUrlId: string): Promise<File | undefined> {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2ShareByIdFile>>
  try {
    resp = await phoenixRestService.getV2ShareByIdFile(currentUserStore.bearer!, shareUrlId)
  } catch (e) {
    throw new PhoenixInternalError('Critically failed to fetch file. Cause: ' + (<Error>e).message)
  }

  if (resp.status !== 200) {
    await throw404Error()
    return undefined
  }
  return resp.data
}

async function getShareURL(shareUrlId: string): Promise<ShareUrl | undefined> {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2ShareById>>
  try {
    resp = await phoenixRestService.getV2ShareById(currentUserStore.bearer!, shareUrlId)
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch share URL. Cause: ' + (<Error>e).message,
    )
  }

  if (resp.status !== 200) {
    await throw404Error()
    return undefined
  }
  return resp.data
}

async function handleShareURLReq(shareUrlId: string): Promise<void> {
  if (!shareUrlId) {
    loadingStore.setLoading(false)
    await $router.push('/404')
    return
  } else if (!currentUserStore.loggedIn) {
    loadingStore.setLoading(false)
    await $router.push({ path: '/login', query: { returnTo: $route.fullPath } })
    showWarnNotif(
      'Not logged in',
      'You need to be logged in to view this file. Please log in first and try again.',
    )
    return
  }

  const file = await getFile(shareUrlId)
  if (!file) {
    return
  }
  const shareURL = await getShareURL(shareUrlId)
  if (!shareURL) {
    return
  }

  // The owner themselves can use the share URL so we need to make sure they see it as it were their own file
  const isShareFileOwner = currentUserStore.currentUser?.id === file.owner_id
  if (isShareFileOwner) {
    currentFileStore.setFile(file)
  } else {
    let permissions = await getFilePermissionsForUser(file, shareURL.perms)
    currentFileStore.setFileFromShared(file, shareUrlId, <Permission>permissions)
  }
  loadingStore.setLoading(false)
  await $router.push({
    path: '/editor',
    query: isShareFileOwner ? undefined : { shareId: shareUrlId },
  })
}

async function getFilePermissionsForUser(file: File, permissionsFromUrl: number): Promise<number> {
  let perm: FilePermission | undefined = await getFilePermissionsForCurrentUser(file)
  if (perm !== undefined) {
    return perm.permission
  }
  await createFilePermission(file, permissionsFromUrl)
  return permissionsFromUrl
}

async function createFilePermission(file: File, permissionsFromUrl: number) {
  try {
    let createFilePermissions: CreateFilePermissions = {
      permission: permissionsFromUrl,
      file_id: file.id,
      user_id: currentUserStore.currentUser?.id!,
    }
    await phoenixRestService.postV2FilesPermissions(currentUserStore.bearer!, createFilePermissions)
    await contributorsStore.fetchAndUpdateContributors(currentUserStore.bearer!, file.id)
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
      'Criticaly faild to fetch file permission. Cause: ' + (<Error>e).message,
    )
  }
  return <FilePermission>currentUserFilePermissions.data
}

interceptErrors(handleShareURLReq(`${$route.params.shareUrlId}`))
</script>

<template>
  <ProgressSpinner />
</template>

<style lang="scss" scoped></style>
