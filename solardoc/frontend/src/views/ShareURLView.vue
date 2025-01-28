<script lang="ts" setup>
import LoadingProgressSpinner from '@/components/common/LoadingProgressSpinner.vue'
import { useLoadingStore } from '@/stores/loading'
import { useRoute, useRouter } from 'vue-router'
import { interceptErrors } from '@/errors/handler/error-handler'
import { initEditorFileBasedOnShareURL } from '@/scripts/share/resolve-share-url'

const loadingStore = useLoadingStore()

const $route = useRoute()
const $router = useRouter()

loadingStore.setLoading(true)
interceptErrors(
  (async () => {
    await initEditorFileBasedOnShareURL($router, `${$route.params.shareUrlId}`)
    loadingStore.setLoading(false)
  })(),
)
</script>

<template>
  <LoadingProgressSpinner />
</template>

<style lang="scss" scoped></style>
