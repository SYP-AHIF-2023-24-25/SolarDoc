<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { useInitStateStore } from '@/stores/init-state'
import SlideManagerSubSlidePreview
  from "@/components/editor/sub-views/full-screen-slides-manager/sub-slides-navigator/SlideManagerSubSlidePreview.vue";
import {usePreviewSelectedSlideStore} from "@/stores/preview-selected-slide";

const renderDataStore = useRenderDataStore()
const initStateStore = useInitStateStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()

const { previewURL, subslideCountPerSlide } = storeToRefs(renderDataStore)
const { slideIndex } = storeToRefs(previewSelectedSlideStore)
</script>

<template>
  <div
    id="sub-slides-navigator"
    v-if="!initStateStore.init && previewURL"
    ref="subSlidesNavigatorEl"
  >
    <!-- For every *main* slide, create a sub-slide preview -->
    <SlideManagerSubSlidePreview
      v-for="i in Array(subslideCountPerSlide[slideIndex])
        .fill(null)
        .map((_, i) => i)"
      :key="i"
      :slide-index="slideIndex"
      :sub-slide-index="i"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#sub-slides-navigator {
  display: flex;
  flex-flow: row nowrap;
  height: var.$editor-slides-manager-sub-slides-navigator-height;
  max-height: var.$editor-slides-manager-sub-slides-navigator-height;
  padding: var.$editor-slides-manager-sub-slides-navigator-padding;
  width: 100%;
  overflow: scroll hidden;
}
</style>
