<script setup lang="ts"></script>

<template>
  <div id="docs-page">
    <h1>This is a docs page</h1>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/view-presets' as *;

div#docs-page {
  @include view-presets;
}
</style>
