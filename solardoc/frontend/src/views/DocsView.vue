<script lang="ts" setup></script>

<template>
  <div id="docs-page">
    <h1>
      As Solardoc is still under development please kindly wait until we are able to roll out proper
      documentation! 💜
    </h1>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/screen-size' as *;

div#docs-page {
  @include view-presets;
  @include align-center;

  h1 {
    width: 90%;
    text-align: center;

    @include r-min(var.$window-xmedium) {
      width: 50%;
    }
  }
}
</style>
