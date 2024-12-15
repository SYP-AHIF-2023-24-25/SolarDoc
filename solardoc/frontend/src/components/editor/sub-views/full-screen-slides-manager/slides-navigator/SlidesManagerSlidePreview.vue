<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'

defineEmits(["slideSelected"])
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
    :id="'slide-manager-slide-preview-' + slideIndex"
    :class="`slide-manager-slide-preview ${previewLoadingStore.previewLoading ? 'loading' : ''}`"
    @click="previewSelectedSlide.setSlide(slideIndex, undefined)"
  >
    <h2 v-if="previewLoadingStore.previewLoading" id="loading-wrapper">
      <span class="dot-dot-dot-flashing"></span>
    </h2>
    <template v-else>
      <p id="slide-index">{{ slideIndex + 1 }}</p>
      <iframe :src="`${previewURL}?static=true&slide=${slideIndex}#/${slideIndex}`"></iframe>
      <div id="slide-click-event-catch" @click="$emit('slideSelected', slideIndex)"></div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

.slide-manager-slide-preview {
  flex: 0 0 auto;
  padding: 0;
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
  margin: 0 0 var.$editor-slides-manager-navigator-element-margin 0;

  $width: calc(100vw - 2 * var(--editor-slides-manager-slides-navigator-padding));
  height: calc($width / 2);
  width: $width;
  @include r-min(var.$window-medium) {
    height: var.$editor-slides-manager-navigator-element-height;
    width: var.$editor-slides-manager-navigator-element-width;
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

  #slide-click-event-catch {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    z-index: 0;

    &,
    & * {
      overflow: hidden !important;
      pointer-events: none !important;
    }
  }
}
</style>
