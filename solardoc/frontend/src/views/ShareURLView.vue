<script setup lang="ts">
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import { useCurrentFileStore } from '@/stores/current-file'
import { onMounted } from 'vue'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRoute, useRouter } from 'vue-router'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import { useLoadingStore } from '@/stores/loading'

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
      throw new PhoenixInternalError('Critically failed to fetch file. Cause: ' + (<Error>e).message)
    }

    if (resp.status === 401) {
      throw new PhoenixRestError(
          'Server rejected request to fetch file. Cause: Unauthorized',
          resp.status,
      )
    } else if (resp.status === 200) {

      let getShare: Awaited<ReturnType<typeof phoenixRestService.getV1ShareById>>
      try{
        getShare = await phoenixRestService.getV1ShareById(currentUserStore.bearer!, shareUrlId)
      } catch (e) {
        throw new PhoenixInternalError('Critically failed to fetch share URL. Cause: ' + (<Error>e).message)
      }
      if(getShare.status === 200){
        currentFileStore.setContent(resp.data.content)
        currentFileStore.setFileId(resp.data.id)
        currentFileStore.setFileName(resp.data.file_name)
        currentFileStore.setPermissions(getShare.data.perms)
        loadingStore.setLoading(false)
        await $router.push('/editor')
      }
      else if(getShare.status === 401){
        throw new PhoenixRestError(
            'Server rejected request to fetch share URL. Cause: Unauthorized',
            getShare.status,
        )
      }
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
