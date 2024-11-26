<script setup lang="ts">
import Editor from '@/components/editor/Editor.vue'
import ArrowLeft from '@/components/icons/ArrowLeft.vue'
</script>

<template>
  <div id="editor-wrapper">
    <div id="change-view-buttons">
      <div id="change-layout-to-default" @click="$emit('viewStateUpdate')">
        <ArrowLeft />
      </div>
    </div>
    <Editor></Editor>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#editor-wrapper {
  display: flex;
  flex-flow: row nowrap;
  height: var.$editor-monaco-height;
  width: calc(100vw - var(--scrollbar-width));
  max-width: 100vw;
  position: relative;
  box-sizing: border-box;

  #change-view-buttons {
    position: absolute;
    top: calc(var(--editor-preview-frame-height) - 4rem);
    right: 0;
    width: 1rem;
    height: 3rem;
    z-index: 10;

    #change-layout-to-default {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      right: 0;
      width: 2rem;
      height: 4rem;
      background-color: rgba(#e5e7eb, 0.5);
      opacity: 0.9;
      border-radius: 5rem 0 0 5rem;

      &:hover {
        background-color: rgba(#e5e7eb, 0.9);
        cursor: pointer;
      }
    }
  }
}
</style>
