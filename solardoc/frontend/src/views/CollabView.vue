<script lang="ts" setup>
import GlobalFilesOverview from "@/components/collab/GlobalFilesOverview.vue";
</script>

<template>
  <div id="collab-page">
    <div id="header">
      <h1>Collab</h1>
    </div>
    <div id="content-view">
      <GlobalFilesOverview />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/screen-size' as *;

#collab-page {
  @include scrollable-view-presets;
  @include align-center;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-flow: column nowrap;
  gap: 2rem;
  width: 100%;

  #header {
    @include align-center;

    h1 {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  }

  #content-view {
    display: flex;
    flex-flow: column nowrap;
    margin-bottom: 2rem;
    width: 100%;
    padding: 2rem;

    @include r-min(var.$window-medium) {
      width: 80%;
      padding: 0;
    }

    @include r-min(var.$window-large) {
      width: 70%;
      padding: 0;
    }
  }
}
</style>
