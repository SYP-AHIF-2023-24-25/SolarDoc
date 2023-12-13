<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup lang="ts">
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { Ref } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { lightEditorTheme } from './monaco-config/light-editor-theme'
import { darkEditorTheme } from './monaco-config/dark-editor-theme'
import { ref, onMounted } from 'vue'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'
import { useDarkModeStore } from '@/stores/dark-mode'
import type { MutationType, SubscriptionCallbackMutation } from 'pinia'
import {useEditorContentStore} from "@/stores/editor-content";
import {usePreviewLoadingStore} from "@/stores/preview-loading";
import {useInitStateStore} from "@/stores/init-state";

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

let localStorageIdentifier = 'reloadText'
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
const editorRef = <Ref<HTMLElement>>ref(document.querySelector('#editor'))
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

  let reloadText =
    localStorage.getItem(localStorageIdentifier) ||
    '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'
  // Creating the editor with desired theme and language
  editorInstance = monaco.editor.create(editorRef.value!, {
    theme: darkModeStore.darkMode ? 'asciiDocDarkTheme' : 'asciiDocLightTheme',
    language: 'asciiDoc',
    value: [`${reloadText}`].join('\n'),
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
    const unsupportedKeyCharacters = [
      "Shift", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Control", "Alt", "CapsLock",
      "Tab", "Backspace", "Meta", "ContextMenu", "PageUp", "PageDown", "End", "Home", "Insert", "Delete", "Pause",
      "ScrollLock", "PrintScreen", "NumLock", "Clear", "Help", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9",
      "F10", "F11", "F12"
    ];
    if (unsupportedKeyCharacters.includes(event.code)) return

    initStateStore.setFalse()
    previewLoadingStore.setPreviewLoading(true)

    // If there is an active timeout, then cancel it and force the creation of a new one
    // (to avoid saving the text too often)
    if (activeTimeout) clearTimeout(activeTimeout)

    activeTimeout = setTimeout(() => {
      console.log('[Editor] Saving editor content to local storage')
      localStorage.setItem(localStorageIdentifier, editorInstance!.getValue())

      console.log('[Editor] Broadcasting update')
      editorContentStore.setEditorContent(editorInstance!.getValue())
    }, EDITOR_UPDATE_TIMEOUT)
  })

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
