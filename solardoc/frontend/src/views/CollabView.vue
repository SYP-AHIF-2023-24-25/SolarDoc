<script lang="ts" setup>
import GlobalFilesOverview from '@/components/collab/GlobalFilesOverview.vue'
</script>

<template>
  <div id="collab-page">
    <div id="header">
      <h1>Team Collab<span id="experimental-tag">Experimental</span></h1>
      <p>Join and collaborate with your team members on projects.</p>
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
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    margin-bottom: 1.5rem;

    h1 {
      font-size: 4rem;
      margin-bottom: 1rem;

      span#experimental-tag {
        position: relative;
        font-size: 1.25rem;
        top: -2.5rem;
        left: -0.5rem;
        color: var.$text-color;
        font-style: italic;
      }
    }

    p {
      font-size: 1.5rem;
      text-align: center;
      margin: 0;
      padding: 0;
      width: 80%;
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
