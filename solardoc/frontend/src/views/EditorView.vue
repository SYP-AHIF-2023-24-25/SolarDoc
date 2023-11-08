<script setup lang="ts">
import Editor from '@/components/editor/Editor.vue'
</script>

<template>
  <main>
    <div id="menu">
      <div id="button-menu">
        <p>Copy</p>
        <p>Share</p>
        <p>Download</p>
      </div>
      <p>sample-presentation.adoc</p>
      <p>Last edited: 20:08 14-10-2023 CET</p>
    </div>
    <div id="editor-and-preview-wrapper">
      <div id="editor-wrapper">
        <Editor></Editor>
      </div>
      <div id="preview">
        <div id="preview-menu">
          <p>3 slides</p>
          <p>1.2 MB Raw Size</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  #menu {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    #button-menu {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
    }
  }

  #editor-and-preview-wrapper {
    display: flex;
    flex-flow: row nowrap;

    #editor {
      display: flex;
      flex-flow: column nowrap;
      width: 100vh;
      height: 100vh;
      border: 1px black solid;
    }

    #preview-menu {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
    }
  }
}
</style>
