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
      gap: 1rem;
    }
  }

  #editor-and-preview-wrapper {
    display: flex;
    flex-flow: row nowrap;
    border-top: 0.1rem black solid;

    #editor {
      display: flex;
      flex-flow: column nowrap;
      width: 105vh;
      height: 86.2vh;
      padding-top: 1rem;
    }

    #editor-wrapper{
      border-right: 0.1rem black solid;
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
        border-bottom: 0.1rem black solid;
        justify-content: space-between;
      }

      #slides-navigator{
        border-bottom: 0.1rem black solid;
        padding-top: 4vh;
        padding-bottom: 4vh;
      }

      #sub-slides-navigator{
        padding-top: 13vh;
        padding-bottom: 13vh;
      }

      #preview{
        border-bottom: 0.1rem black solid;
        padding-top: 16.4vh;
        padding-bottom: 16.4vh;
      }
    }
  }
}
</style>
