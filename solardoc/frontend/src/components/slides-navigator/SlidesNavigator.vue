<script setup lang="ts">
import {useRenderDataStore} from "@/stores/render-data";
import {storeToRefs} from "pinia";
import SlidePreview from "@/components/slides-navigator/SlidePreview.vue";
import {useInitStateStore} from "@/stores/init-state";
import {ref} from "vue";

const renderDataStore = useRenderDataStore()
const initStateStore = useInitStateStore()

const { slideCount } = storeToRefs(renderDataStore)
</script>

<template>
<div id="slides-navigator" v-if="!initStateStore.init">
  <!-- For every *main* slide, create a slide preview -->
  <SlidePreview
    v-for="i in <Array<number>>Array(slideCount || 2).fill(null).map((_, i) => i)"
    :key="i"
    :slide-index="i"
  />
</div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#slides-navigator {
  display: flex;
  flex-flow: row nowrap;
  padding: var.$editor-preview-slides-navigator-padding;
  margin: 0;
  height: var.$editor-preview-slides-navigator-height;
  width: var.$editor-preview-slides-navigator-width;

  // Scrollable content on the x-axis
  overflow-x: scroll;
  overflow-y: hidden;
}
</style>
