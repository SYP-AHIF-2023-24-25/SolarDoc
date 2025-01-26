<script setup lang="ts">
import { useRenderDataStore } from '@/stores/render-data'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { storeToRefs } from 'pinia'

defineProps({
  slideIndex: {
    type: Number,
    required: true,
  },
  subSlideIndex: {
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
    :id="'sub-slide-preview-' + slideIndex + '-' + subSlideIndex"
    :class="`sub-slide-preview ${previewLoadingStore.previewLoading ? 'loading' : ''}`"
    @click="previewSelectedSlide.setSlide(slideIndex, subSlideIndex,true)"
  >
    <h2 id="loading-wrapper" v-if="previewLoadingStore.previewLoading">
      <span class="dot-dot-dot-flashing"></span>
    </h2>
    <template v-else>
      <p id="slide-index">{{ slideIndex + 1 }}.{{ subSlideIndex + 1 }}</p>
      <iframe
        :src="`${previewURL}?static=true&slide=${slideIndex}/${subSlideIndex + 1}#/${slideIndex}/${
          subSlideIndex + 1
        }`"
      ></iframe>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

.sub-slide-preview {
  flex: 0 0 auto;
  height: var.$editor-preview-sub-slides-navigator-list-element-height;
  width: var.$editor-preview-sub-slides-navigator-list-element-width;
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  margin: 0 0 var.$editor-preview-sub-slides-navigator-list-element-margin 0;

  &:first-child {
    margin-top: var.$editor-preview-slides-navigator-element-margin;
  }

  &:hover {
    cursor: pointer;
    border: 3px solid var.$scheme-cs-2;
  }

  &:active {
    transform: scale(0.99);
  }

  &.loading {
    @include align-center;
    border: 2px solid var.$scheme-cs-2;
  }

  #slide-index {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 1;
    color: rgba(255, 255, 255, 0.6);
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
