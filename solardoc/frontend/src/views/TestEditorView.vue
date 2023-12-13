<script setup lang="ts">
import Editor from '@/components/editor/Editor.vue'
</script>

<template>
  <div id="test-editor-page">
    <Editor></Editor>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/view-presets' as *;

div#test-editor-page {
  @include view-presets;
}
</style>
