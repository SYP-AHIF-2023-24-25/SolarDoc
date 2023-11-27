<script setup lang="ts"></script>

<template>
  <div id="about-page">
    <h1>This is an about page</h1>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/view-presets' as *;

div#about-page {
  @include view-presets;
}
</style>
