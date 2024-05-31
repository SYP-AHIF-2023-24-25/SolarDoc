<script lang="ts" setup>
import Editor from '@/components/editor/Editor.vue'
</script>

<template>
  <div id="test-editor-page">
    <Editor></Editor>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/view-presets' as *;

div#test-editor-page {
  @include view-presets;
}
</style>
