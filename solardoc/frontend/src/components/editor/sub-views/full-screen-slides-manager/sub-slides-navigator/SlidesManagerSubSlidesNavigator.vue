<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { useInitStateStore } from '@/stores/init-state'
import SlideManagerSubSlidePreview from '@/components/editor/sub-views/full-screen-slides-manager/sub-slides-navigator/SlideManagerSubSlidePreview.vue'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { showDummyLoading } from '@/scripts/show-dummy-loading'
import type { Ref } from 'vue'

const renderDataStore = useRenderDataStore()
const initStateStore = useInitStateStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()
const { previewURL, subslideCountPerSlide } = <
  { previewURL: Ref<string>; subslideCountPerSlide: Ref<Array<number>> }
>storeToRefs(renderDataStore)
const { slideIndex } = storeToRefs(previewSelectedSlideStore)
</script>

<template>
  <div
    id="sub-slides-navigator"
    v-if="!initStateStore.init && previewURL"
    ref="subSlidesNavigatorEl"
  >
    <button id="phone-return-to-slides-manager" @click="$emit('slideUnselected')">&lt;&lt; Go back to slides view</button>
    <div id="phone-sub-slides-info-bar">
      <p id="phone-sub-slides-info">Slide {{ slideIndex }}</p>
      <p id="phone-sub-slides-info">Sub-slides {{ subslideCountPerSlide[slideIndex] }}</p>
    </div>
    <div id="phone-nothing-to-see-here" v-if="subslideCountPerSlide[slideIndex] === 0">
      <p>
        Nothing to see here :(
      </p>
    </div>
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
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

#sub-slides-navigator {
  display: flex;
  padding: var.$editor-slides-manager-sub-slides-navigator-padding;
  width: 100%;
  overflow: scroll hidden;

  #phone-return-to-slides-manager {
    @include show-that-respects-svg();
    @include link-hover-presets();
    display: flex;
    justify-content: start;
    align-items: start;
    margin-bottom: 0.4rem;
    width: fit-content;
  }

  #phone-sub-slides-info-bar {
    @include show-that-respects-svg();
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 0 0 1rem 0;
    border-bottom: var.$editor-border;

    p {
      font-size: 1.2rem;
    }
  }

  #phone-nothing-to-see-here {
    @include align-center();
    flex-grow: 10;
  }

  height: 100%;
  max-height: 100%;
  flex-flow: column nowrap;
  @include r-min(var.$window-medium) {
    height: var.$editor-slides-manager-sub-slides-navigator-height;
    max-height: var.$editor-slides-manager-sub-slides-navigator-height;
    flex-flow: row nowrap;

    #phone-sub-slides-info-bar {
      @include hide-that-respects-svg();
    }
  }
}
</style>
