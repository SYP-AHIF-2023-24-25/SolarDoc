<script setup lang="ts"></script>

<template>
  <div class="menu">
    <div class="btn-menu">
      <p>Copy</p>
      <p>Share</p>
      <p>Download</p>
    </div>
    <p>sample-presentation.adoc</p>
    <p>Last edited: 20:08 14-10-2023 CET</p>
  </div>
  <div class="editor-preview">
    <div class="editor">
      <p>Editor</p>
    </div>
    <div class="preview">
      <div class="preview-menu">
        <p>3 slides</p>
        <p>1.2 MB Raw Size</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-preview {
  display: flex;
  flex-flow: row nowrap;
}

.editor {
  display: flex;
  flex-flow: column nowrap;
  width: 100vh;
  height: 100vh;
  border: 1px black solid;
}

.preview-menu {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.btn-menu {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.menu {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>
