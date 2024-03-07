<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'

defineProps({
  slideIndex: {
    type: Number,
    required: true,
  },
})

const renderDataStore = useRenderDataStore()
const previewLoadingStore = usePreviewLoadingStore()
const previewSelectedSlide = usePreviewSelectedSlideStore()

const { previewURL } = storeToRefs(renderDataStore)
</script>

<template>
  <div
    :id="'slide-preview-' + slideIndex"
    :class="`slide-preview ${previewLoadingStore.previewLoading ? 'loading' : ''}`"
    @click="previewSelectedSlide.setSlide(slideIndex, undefined)"
  >
    <h2 id="loading-wrapper" v-if="previewLoadingStore.previewLoading">
      <span class="dot-dot-dot-flashing"></span>
    </h2>
    <template v-else>
      <p id="slide-index">{{ slideIndex + 1 }}</p>
      <iframe :src="`${previewURL}?static=true&slide=${slideIndex}#/${slideIndex}`"></iframe>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

.slide-preview {
  flex: 0 0 auto;
  width: var.$editor-preview-slides-navigator-element-width;
  height: var.$editor-preview-slides-navigator-element-height;
  margin: 0 var.$editor-preview-slides-navigator-element-margin;
  padding: 0;
  border-radius: 0.5rem;
  position: relative;
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

  #slide-index {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 1;
    color: rgba(255, 255, 255, 0.6);
  }

  &.loading {
    @include align-center;
    border: 2px solid var.$scheme-cs-2;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;

    &,
    & * {
      overflow: hidden !important;
      pointer-events: none !important;
    }
  }
}
</style>
