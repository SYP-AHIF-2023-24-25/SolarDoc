<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useRenderDataStore} from "@/stores/render-data";

const props = defineProps({
  slideIndex: {
    type: Number,
    required: true
  }
})

const renderDataStore = useRenderDataStore()

const { previewURL } = storeToRefs(renderDataStore)
</script>

<template>
<div class="slide-preview">
  <iframe
    :src="`${previewURL}/#${slideIndex}`"
  ></iframe>
</div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

.slide-preview {
  flex: 0 0 auto;
  width: var.$editor-preview-slides-navigator-element-width;
  height: var.$editor-preview-slides-navigator-element-height;
  margin: 0 var.$editor-preview-slides-navigator-element-margin 0 0;
  padding: 0;
  border-radius: 0.5rem;
  overflow: hidden;

  // First slide should have a margin on the left
  &:first-child {
    margin-left: var.$editor-preview-slides-navigator-element-margin;
  }

  &:hover {
    cursor: pointer;
    border: 3px solid var.$scheme-cs-2;
  }

  &:active {
    transform: scale(0.99);
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    pointer-events: none;

    .scrollbar {
      display: none;
    }
  }
}
</style>
