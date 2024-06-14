<script setup lang="ts">
import SlideSubSlidesPreview from '@/components/editor/sub-slides-navigator/SlideSubSlidesPreview.vue'
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { useInitStateStore } from '@/stores/init-state'
import { useScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { usePreviewMenuSlideStateStore } from '@/stores/preview-menu-slide-state'

const renderDataStore = useRenderDataStore()
const initStateStore = useInitStateStore()
const previewMenuSlideStateStore = usePreviewMenuSlideStateStore()

const { slideCount, previewURL } = storeToRefs(renderDataStore)
const { x: globalY } = storeToRefs(previewMenuSlideStateStore)

const subSlidesNavigatorEl = ref<HTMLElement | null>(null)
const { x } = useScroll(subSlidesNavigatorEl)

// Automatically update scroll state when the user scrolls
watch(x, () => {
  previewMenuSlideStateStore.setX(x.value)
})

watch(globalY, () => {
  if (subSlidesNavigatorEl.value) {
    x.value = globalY.value
  }
})
</script>

<template>
  <div
    id="sub-slides-navigator"
    v-if="!initStateStore.init && previewURL"
    ref="subSlidesNavigatorEl"
  >
    <!-- For every *main* slide, create a sub-slide preview -->
    <SlideSubSlidesPreview
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

#sub-slides-navigator {
  display: flex;
  flex-flow: row nowrap;
  height: var.$editor-preview-sub-slides-navigator-height;
  max-height: var.$editor-preview-sub-slides-navigator-height;
  width: 100%;
  overflow: scroll hidden;
}
</style>
