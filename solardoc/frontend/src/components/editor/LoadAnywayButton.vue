<script lang="ts" setup>
import { handleRender } from '@/scripts/handle-render'
import { useRenderDataStore } from '@/stores/render-data'
import { useCurrentFileStore } from '@/stores/current-file'
import { interceptErrors } from '@/errors/handler/error-handler'

const props = defineProps(['colorMode'])

const renderDataStore = useRenderDataStore()
const currentFileStore = useCurrentFileStore()

async function loadAnyway(): Promise<void> {
  const renderResp = await interceptErrors(
    handleRender(currentFileStore.fileName, currentFileStore.content),
  )
  renderDataStore.setRenderData(renderResp)
}

function getColorModeClass(): string {
  return props.colorMode
    ? props.colorMode === 'dark'
      ? 'dark-mode-overwrite'
      : props.colorMode === 'light'
        ? 'light-mode-overwrite'
        : ''
    : ''
}
</script>

<template>
  <button
    id="load-anyway-button"
    :class="`block-button ${getColorModeClass()}`"
    @click="loadAnyway()"
  >
    Load anyway!
  </button>
</template>

<style lang="scss" scoped></style>
