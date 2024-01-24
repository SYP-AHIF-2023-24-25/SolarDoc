<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useRenderDataStore} from "@/stores/render-data";
import SlideSubSlidePreview from "@/components/sub-slides-navigator/SlideSubSlidePreview.vue";

defineProps({
  slideIndex: {
    type: Number,
    required: true,
  },
})

const renderDataStore = useRenderDataStore()

const { subslideCountPerSlide } = storeToRefs(renderDataStore)
</script>

<template>
  <div
    :id="'slide-sub-slides-navigator-' + slideIndex"
    class="slide-sub-slides-navigator"
  >
    <template v-if="subslideCountPerSlide">
      <div class="slide-sub-slides-navigator-list">
        <SlideSubSlidePreview
          v-for="i in Array(subslideCountPerSlide[slideIndex]).fill(null).map((_, i) => i)"
          :key="i"
          :slide-index="slideIndex"
          :sub-slide-index="i">
        </SlideSubSlidePreview>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

.slide-sub-slides-navigator {
  flex: 0 0 auto;
  flex-flow: column nowrap;
  width: var.$editor-preview-sub-slides-navigator-list-width;
  height: var.$editor-preview-sub-slides-navigator-list-height;
  margin: 0 0 0.5rem 0;
  padding: 0;
  overflow: hidden scroll;

  border-right: 1px solid var.$scheme-gray;

  .slide-count {
    margin: 0.5rem;
  }

  .slide-sub-slides-navigator-list {
    // Align content in the center on the x-axis
    display: flex;
    flex: 0 0 auto;
    flex-flow: column nowrap;
    align-items: center;
  }
}
</style>
