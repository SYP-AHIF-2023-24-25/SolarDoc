<script lang="ts" setup>
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import { type Permission, useCurrentFileStore } from '@/stores/current-file'
import type { File, ShareUrl } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { PhoenixInternalError } from '@/services/phoenix/errors'
import { useLoadingStore } from '@/stores/loading'
import { useRoute, useRouter } from 'vue-router'
import { showWarnNotif } from '@/scripts/show-notif'
import { interceptErrors } from '@/errors/handler/error-handler'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const loadingStore = useLoadingStore()

const $route = useRoute()
const $router = useRouter()

loadingStore.setLoading(true)

function throw404Error(): Promise<any> {
  return $router.push('/404')
}

async function getFile(shareUrlId: string): Promise<File | undefined> {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV1ShareByIdFile>>
  try {
    resp = await phoenixRestService.getV1ShareByIdFile(currentUserStore.bearer!, shareUrlId)
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
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV1ShareById>>
  try {
    resp = await phoenixRestService.getV1ShareById(currentUserStore.bearer!, shareUrlId)
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
    await $router.push('/login')
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
  currentFileStore.setFileFromShared(file, shareUrlId, <Permission>shareURL.perms)
  loadingStore.setLoading(false)
  await $router.push('/editor')
}

interceptErrors(handleShareURLReq(`${$route.params.shareUrlId}`))
</script>

<template>
  <ProgressSpinner></ProgressSpinner>
</template>

<style lang="scss" scoped></style>
