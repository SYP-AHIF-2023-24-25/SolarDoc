<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup>
  import { ref, onMounted} from 'vue';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch.js';
  import { editorTheme } from './monaco-config/editor-theme.js';

  const editorRef = ref(null);
  let editorInstance = null;

  window.onbeforeunload = function(event) {
    localStorage.setItem('reloadText',editorInstance.getValue() );
  };

  onMounted(() => {
    // Register a new language
    monaco.languages.register({ id: "asciiDoc" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("asciiDoc", asciiDocLangMonarch);

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("asciiDocTheme", editorTheme);

    let reloadText= localStorage.getItem('reloadText');
    // Creating the editor with desired theme and language
    editorInstance= monaco.editor.create(editorRef.value, {
      theme: "asciiDocTheme",
      language: "asciiDoc",
      value:[
          `${reloadText}`
      ].join('\n')
    });
  });

  /*onBeforeUnmount(()=>{
    localStorage.removeItem('reloadText');
    if (editorInstance) {
      let text = editorInstance.getValue();
      console.log(text);
      localStorage.setItem('reloadText', text);
    }
  });*/
</script>

<style scoped>
  #editor {
    width: 100vw;
    height: 100vh;
  }
</style>