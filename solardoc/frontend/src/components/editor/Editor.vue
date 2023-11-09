<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup lang="ts">
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { Ref } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { editorTheme } from './monaco-config/editor-theme'
import { ref, onMounted } from 'vue'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let localStorageIdentifier = 'reloadText'
const editorRef = <Ref<HTMLElement>>ref(document.querySelector('#editor'))
onMounted(() => {
  // Register a new language
  monaco.languages.register({ id: 'asciiDoc' })

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider(
    'asciiDoc',
    <languages.IMonarchLanguage>asciiDocLangMonarch
  )

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme('asciiDocTheme', <editor.IStandaloneThemeData>editorTheme)

  let reloadText =
    localStorage.getItem(localStorageIdentifier) ||
    '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'
  // Creating the editor with desired theme and language
  editorInstance = monaco.editor.create(editorRef.value!, {
    theme: 'asciiDocTheme',
    language: 'asciiDoc',
    value: [`${reloadText}`].join('\n'),
    fontFamily: 'JetBrains Mono',
    minimap: {
      enabled: false
    },
    wordWrap: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false
  })

  // This is an ID of the timeout
  let activeTimeout: ReturnType<typeof setTimeout>;
  editorInstance.onKeyUp(() => {
    // If there is an active timeout, then cancel it and force the creation of a new one
    // (to avoid saving the text too often)
    if (activeTimeout) clearTimeout(activeTimeout)

    activeTimeout = setTimeout(() => {
      console.log('saving new text to local storage')
      localStorage.setItem(localStorageIdentifier, editorInstance!.getValue())
    }, 1000)
  })
})
</script>

<style scoped>
#editor {
  width: 50vw;
  height: 100vh;
}
</style>
