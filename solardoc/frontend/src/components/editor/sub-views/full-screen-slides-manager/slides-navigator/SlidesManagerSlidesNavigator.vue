<script setup lang="ts">
import SlidePreview from '@/components/editor/sub-views/default/slides-navigator/SlidePreview.vue'
import { useRenderDataStore } from '@/stores/render-data'
import { storeToRefs } from 'pinia'
import { useInitStateStore } from '@/stores/init-state'
import { ref, watch } from 'vue'
import { useScroll } from '@vueuse/core'
import { usePreviewMenuSlideStateStore } from '@/stores/preview-menu-slide-state'
import SlidesManagerSlidePreview from '@/components/editor/sub-views/full-screen-slides-manager/slides-navigator/SlidesManagerSlidePreview.vue'

const renderDataStore = useRenderDataStore()
const initStateStore = useInitStateStore()
const previewMenuSlideStateStore = usePreviewMenuSlideStateStore()

const { slideCount, previewURL } = storeToRefs(renderDataStore)
const { x: globalX } = storeToRefs(previewMenuSlideStateStore)

const slidesNavigatorEl = ref<HTMLElement | null>(null)
const { x } = useScroll(slidesNavigatorEl)

// Automatically update scroll state when the user scrolls
watch(x, () => {
  previewMenuSlideStateStore.setX(x.value)
})

watch(globalX, () => {
  if (slidesNavigatorEl.value) {
    x.value = globalX.value
  }
})
</script>

<template>
  <div v-if="!initStateStore.init && previewURL" id="slides-navigator" ref="slidesNavigatorEl">
    <!-- For every *main* slide, create a slide preview -->
    <SlidesManagerSlidePreview
      v-for="i in Array(slideCount || 2)
        .fill(null)
        .map((_, i) => i)"
      :key="i"
      :slide-index="i"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#slides-navigator {
  display: flex;
  flex-flow: column nowrap;
  padding: var.$editor-slides-manager-slides-navigator-padding;
  margin: 0;
  height: var.$editor-slides-manager-slides-navigator-height;
  width: var.$editor-slides-manager-slides-navigator-width;
  overflow: hidden;
  overflow-y: scroll;
}
</style>
