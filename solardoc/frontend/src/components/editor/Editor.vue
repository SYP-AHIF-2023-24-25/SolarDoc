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
  let localStorageIdentifier = 'reloadText';

  /*window.onbeforeunload = function(event) {
    localStorage.setItem(localStorageIdentifier,editorInstance.getValue() );
  };*/

  let cancel;
  onMounted(() => {
    // Register a new language
    monaco.languages.register({ id: "asciiDoc" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("asciiDoc", asciiDocLangMonarch);

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("asciiDocTheme", editorTheme);

    let reloadText= localStorage.getItem(localStorageIdentifier)||'= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°';
    // Creating the editor with desired theme and language
    editorInstance= monaco.editor.create(editorRef.value, {
      theme: "asciiDocTheme",
      language: "asciiDoc",
      value:[
          `${reloadText}`
      ].join('\n')
    });


    editorInstance.onKeyUp(()=>{
      if (cancel) clearTimeout(cancel);
      cancel = setTimeout(() => {
        console.log("saving new text to local storage");
        localStorage.setItem(localStorageIdentifier, editorInstance.getValue());

      }, 1000);
    });
  });

</script>

<style scoped>
  #editor {
    width: 100vw;
    height: 100vh;
  }
</style>