<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup lang="ts">

import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { MutationType, SubscriptionCallbackMutation } from 'pinia'
import type { Ref } from 'vue'
import constants from "@/plugins/constants";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { lightEditorTheme } from './monaco-config/light-editor-theme'
import { darkEditorTheme } from './monaco-config/dark-editor-theme'
import { ref, onMounted } from 'vue'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'
import { useDarkModeStore } from '@/stores/dark-mode'
import {useEditorContentStore} from "@/stores/editor-content";
import {usePreviewLoadingStore} from "@/stores/preview-loading";
import {useInitStateStore} from "@/stores/init-state";
import {KeyCode} from "monaco-editor";

type IMarkerData = editor.IMarkerData;

const darkModeStore = useDarkModeStore()
const editorContentStore = useEditorContentStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()

/**
 * The timeout after which the editor will save the text to the local storage.
 *
 * This is used to avoid saving the text too often.
 */
const EDITOR_UPDATE_TIMEOUT = 1000

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
const editorRef = <Ref<HTMLElement>>ref(document.querySelector('#editor'))

/**
 * Checks the editor content for errors and adds markers to the editor.
 * (if a heading doesn't have a space after the equal signs or if a list is inconsistent)
 */
function performErrorChecking() {
  const model = editorInstance?.getModel();
  if (!model) return;

  const lines = model.getLinesContent();
  const markers: IMarkerData[]= [];
  let currentListSymbol: string | null = null;
  lines.forEach((line, lineNumber) => {

    // Checking for errors with headings (==someTextWithoutASpace, ===MoreFalseText, etc.) correct: == someText
    if (line.match(/^={1,6}[^ =].*$/)) {
      const startColumn = line.indexOf('=') + 1;
      const endColumn = line.length;
      const message = 'Error: Heading should have a space after the equal signs';
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: message,
        startLineNumber: lineNumber + 1,
        startColumn: startColumn,
        endLineNumber: lineNumber + 1,
        endColumn: endColumn,
      });
    }
    else {
      // Checking for list errors (continuing a list with a different symbol)
      const match = line.match(/^([*.])\s+[a-zA-Z]/);
      if (match) {
        const listSymbol = match[1];

        // Check if the list symbol changes
        if (currentListSymbol && currentListSymbol !== listSymbol) {
          console.log("list symbol changed" + currentListSymbol + " " + listSymbol)
          const startColumn = line.indexOf(listSymbol) + 1;
          const endColumn = startColumn + 1;
          const message = 'Error: Lists should be consistent (use either "." or "*")';
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: message,
            startLineNumber: lineNumber + 1,  // Lines are 1-indexed
            startColumn: startColumn,
            endLineNumber: lineNumber + 1,
            endColumn: endColumn,
          });
        }
        currentListSymbol = listSymbol;
      }
      else{
        // In case there is a different line, reset the current list symbol to null, to avoid wrong errors
        currentListSymbol = null;
      }
    }
  });

  // Update markers in the editor
  monaco.editor.setModelMarkers(model, 'asciidoc', markers);
}

onMounted(() => {
  // Register a new language
  monaco.languages.register({ id: 'asciiDoc' })

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider(
    'asciiDoc',
    <languages.IMonarchLanguage>asciiDocLangMonarch,
  )

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme('asciiDocLightTheme', <editor.IStandaloneThemeData>lightEditorTheme)
  monaco.editor.defineTheme('asciiDocDarkTheme', <editor.IStandaloneThemeData>darkEditorTheme)

  // Creating the editor with desired theme and language
  editorInstance = monaco.editor.create(editorRef.value!, {
    theme: darkModeStore.darkMode ? 'asciiDocDarkTheme' : 'asciiDocLightTheme',
    language: 'asciiDoc',
    value: editorContentStore.editorContent,
    fontFamily: 'JetBrains Mono',
    minimap: {
      enabled: false,
    },
    wordWrap: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  })

  // This is an ID of the timeout
  let activeTimeout: ReturnType<typeof setTimeout>
  editorInstance.onKeyDown((event: monaco.IKeyboardEvent) => {
    // Ensure it was an actual input (printable character)
    if (event.keyCode > 0 &&
        (event.keyCode <= KeyCode.DownArrow ||
            event.keyCode >= KeyCode.Meta && event.keyCode <= KeyCode.ScrollLock)) {
      return
    }
    initStateStore.setFalse()
    previewLoadingStore.setPreviewLoading(true)

    // Checking new lines for errors
    performErrorChecking();

    // If there is an active timeout, then cancel it and force the creation of a new one
    // (to avoid saving the text too often)
    if (activeTimeout) clearTimeout(activeTimeout)

    activeTimeout = setTimeout(() => {
      console.log('[Editor] Saving editor content to local storage')
      localStorage.setItem(constants.localStorageTextKey, editorInstance!.getValue())

      console.log('[Editor] Broadcasting update')
      editorContentStore.setEditorContent(editorInstance!.getValue())
    }, EDITOR_UPDATE_TIMEOUT)
  })

  // Checking for errors when the editor content changes
  editorInstance.onDidChangeModelContent(() => {
    performErrorChecking();
  });

  // Register an event listener to the darkModeStore to change the theme of the editor
  darkModeStore.$subscribe(
    (
      mutation: SubscriptionCallbackMutation<{ darkMode: boolean }>,
      state: { darkMode: boolean },
    ) => {
      console.log('Changing editor theme to ' + (state.darkMode ? 'dark' : 'light'))
      if (state.darkMode) {
        editorInstance!.updateOptions({
          theme: 'asciiDocDarkTheme',
        })
      } else {
        editorInstance!.updateOptions({
          theme: 'asciiDocLightTheme',
        })
      }
    },
  )
})
</script>

<style scoped>
#editor {
  width: 50vw;
  height: 100vh;
}
</style>
