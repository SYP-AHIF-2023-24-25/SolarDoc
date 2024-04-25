<script setup lang="ts">
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import { useCurrentFileStore } from '@/stores/current-file'
import { onMounted } from 'vue'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRoute, useRouter } from 'vue-router'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import {useLoadingStore} from "@/stores/loading";

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const loadingStore = useLoadingStore()

const $route = useRoute()
const $router = useRouter()

loadingStore.setLoading(true)

async function handleShareURLReq(shareUrlId: unknown): Promise<void> {
  if (typeof shareUrlId !== 'string' || !shareUrlId) {
    loadingStore.setLoading(false)
    await $router.push('/404')
  } else if (!currentUserStore.loggedIn) {
    loadingStore.setLoading(false)
    await $router.push('/login')
  } else {
    let resp: Awaited<ReturnType<typeof phoenixRestService.getV1ShareByIdFile>>
    try {
      resp = await phoenixRestService.getV1ShareByIdFile(currentUserStore.bearer!, shareUrlId)
    } catch (e) {
      throw new PhoenixInternalError('Critically failed to fetch current user. Cause: ' + (<Error>e).message)
    }

    if (resp.status === 401) {
      throw new PhoenixRestError(
          'Server rejected request to fetch current user',
          resp.status,
      )
    } else if (resp.status === 200) {
      // TODO! Merge with new file API introduced by #98 once merged into dev-sprint-5
      currentFileStore.setContent(resp.data.content)
      currentFileStore.setFileId(resp.data.id)
      currentFileStore.setFileName(resp.data.file_name)

      loadingStore.setLoading(false)
      await $router.push('/editor')
    }
  }
}

onMounted(async () => {
  const shareUrlId = $route.params.shareUrlId

  try {
    await handleShareURLReq(shareUrlId)
  } catch (e) {
    loadingStore.setLoading(false)
    throw e
  }
})
</script>

<template>
  <ProgressSpinner></ProgressSpinner>
</template>

<style scoped lang="scss"></style>
