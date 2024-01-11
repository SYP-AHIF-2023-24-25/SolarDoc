<script setup lang="ts">
import {handleRender} from "@/scripts/handle-render";
import {usePreviewURLStore} from "@/stores/preview-url";
import {useEditorContentStore} from "@/stores/editor-content";
import {useFileNameStore} from "@/stores/file-name";

const props = defineProps(['colorMode'])

const previewURLStore = usePreviewURLStore()
const editorContentStore = useEditorContentStore()
const fileNameStore = useFileNameStore()

async function loadAnyway(): Promise<void> {
  const previewURL = await handleRender(fileNameStore.fileName, editorContentStore.editorContent)
  previewURLStore.setPreviewURL(previewURL)
}

function getColorModeClass(): string {
  return props.colorMode ?
      props.colorMode === 'dark' ?
        'dark-mode-overwrite'
        : props.colorMode === 'light' ?
          'light-mode-overwrite'
          : ''
      : '';
}
</script>

<template>
  <button
      id="load-anyway-button"
      :class="`block-button ${getColorModeClass()}`"
      @click="loadAnyway()"
  >Load anyway!</button>
</template>

<style scoped lang="scss">
</style>
