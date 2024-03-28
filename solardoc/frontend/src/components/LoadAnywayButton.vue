<script setup lang="ts">
import { handleRender } from '@/scripts/handle-render'
import { useEditorContentStore } from '@/stores/editor-content'
import { useFileNameStore } from '@/stores/file-name'
import { useRenderDataStore } from '@/stores/render-data'

const props = defineProps(['colorMode'])

const renderDataStore = useRenderDataStore()
const editorContentStore = useEditorContentStore()
const fileNameStore = useFileNameStore()

async function loadAnyway(): Promise<void> {
  const renderResp = await handleRender(fileNameStore.fileName, editorContentStore.editorContent)
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

<style scoped lang="scss"></style>
