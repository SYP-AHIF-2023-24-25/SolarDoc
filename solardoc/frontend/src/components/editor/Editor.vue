<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch.js';
  import { editorTheme } from './monaco-config/editor-theme.js';

  const editorRef = ref(null);

  onMounted(() => {
    // Register a new language
    monaco.languages.register({ id: "asciiDoc" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("asciiDoc", asciiDocLangMonarch);

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("asciiDocTheme", editorTheme);

    // Creating the editor with desired theme and language
    monaco.editor.create(editorRef.value, {
      theme: "asciiDocTheme",
      language: "asciiDoc",
      value:["= This is a heading ",
          "**BOLD**",
          "__italic__",
          "``",
          "code",
          "``"
      ].join('\n')
    });
  });
</script>

<style scoped>
  #editor {
    width: 100vw;
    height: 100vh;
  }
</style>