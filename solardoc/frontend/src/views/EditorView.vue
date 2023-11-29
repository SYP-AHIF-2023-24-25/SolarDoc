<script setup lang="ts">
import Editor from '@/components/editor/Editor.vue'
import SandwichMenuSVG from "@/components/icons/SandwichMenuSVG.vue";
</script>

<template>
  <div id="editor-page">
    <div id="menu">
      <div id="menu-left-side">
        <button id="sandwich-menu-button" class="sandwich-button">
          <SandwichMenuSVG />
        </button>
        <div id="button-menu">
          <button class="editor-button">Copy</button>
          <button class="editor-button">Share</button>
          <button class="editor-button">Download</button>
        </div>
      </div>
      <div id="menu-center">
        <div>
          <p>sample-presentation.adoc</p>
        </div>
      </div>
      <div id="menu-right-side">
        <div>
          <p>Last edited: 20:08 14-10-2023 CET</p>
        </div>
      </div>
    </div>
    <div id="editor-and-preview-wrapper">
      <div id="editor-wrapper">
        <Editor></Editor>
      </div>
      <div id="preview-wrapper">
        <div id="preview">
          <h2>Preview loading...</h2>
        </div>
        <div id="preview-menu">
          <p>3 slides</p>
          <p>1.2 MB Raw Size</p>
        </div>
        <div id="slides-navigator">
          <p>Slides Navigator</p>
        </div>
        <div id="sub-slides-navigator">
          <p>Sub Slides Navigator</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

$left-menu-width: calc(40vw - 0.5rem);
$center-menu-width: 20vw;
$right-menu-width: calc(40vw - 0.5rem);

@mixin menu-child-presets {
  display: flex;
  margin: 0;
  padding: 0;
}

div#editor-page {
  @include view-presets;

  #menu {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: 0 0.5rem;
    height: 2rem;

    #menu-left-side {
      @include menu-child-presets;
      width: $left-menu-width;

      #sandwich-menu-button {
        // TODO!
      }

      #button-menu {
        display: flex;
        flex-flow: row nowrap;

        .editor-button {

        }
      }
    }

    #menu-center {
      @include menu-child-presets;
      width: $center-menu-width;
      justify-content: center;
      align-content: center;

      div {
        @include align-center;
      }
    }

    #menu-right-side {
      @include menu-child-presets;
      width: $right-menu-width;
      justify-content: flex-end;

      div {
        @include align-center;
      }
    }
  }

  #editor-and-preview-wrapper {
    display: flex;
    flex-flow: row nowrap;
    border-top: var.$editor-border;

    #editor {
      display: flex;
      flex-flow: column nowrap;
      width: var.$editor-monaco-width;
      height: var.$editor-monaco-height;
      padding-top: var.$editor-monaco-padding-top;
    }

    #editor-wrapper{
      border-right: var.$editor-border;
    }

    #preview-wrapper{
      display: flex;
      flex-direction: column;
      width: 107vh;
      text-align: center;

      #preview-menu {
        display: flex;
        flex-flow: row nowrap;
        padding-top: 1vh;
        padding-bottom: 1vh;
        border-bottom: var.$editor-border;
        justify-content: space-between;
      }

      #slides-navigator{
        border-bottom: var.$editor-border;
        padding-top: 4vh;
        padding-bottom: 4vh;
      }

      #sub-slides-navigator{
        padding-top: 13vh;
        padding-bottom: 13vh;
      }

      #preview{
        border-bottom: var.$editor-border;
        padding-top: 16.4vh;
        padding-bottom: 16.4vh;
      }
    }
  }
}
</style>
