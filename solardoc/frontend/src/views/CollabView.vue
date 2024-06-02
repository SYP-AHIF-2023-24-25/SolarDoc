<script setup lang="ts">

</script>

<template>
  <div id="docs-page">
    <h1>As Solardoc is still under development please kindly wait until we are able to roll out a proper collab system! 💜</h1>
    <p>For the time being you can already share your presentations using URLs and let other people collab with you!</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/screen-size' as *;

div#docs-page {
  @include view-presets;
  @include align-center;
  flex-direction: column;

  h1 {
    width: 90%;
    text-align: center;

    @include r-min(var.$window-xmedium) {
      width: 50%;
    }
  }
}
</style>
