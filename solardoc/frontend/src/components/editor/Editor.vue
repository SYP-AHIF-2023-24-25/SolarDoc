<template>
  <div id="editor" ref="editorRef"></div>
</template>

<script setup lang="ts">
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { OTransReqDto } from '@/services/phoenix/ot-trans'
import { type Ref, watch } from 'vue'
import { storeToRefs, type SubscriptionCallbackMutation } from 'pinia'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { lightEditorTheme } from './monaco-config/light-editor-theme'
import { darkEditorTheme } from './monaco-config/dark-editor-theme'
import { ref, onMounted } from 'vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import { KeyCode } from 'monaco-editor'
import { useLastModifiedStore } from '@/stores/last-modified'
import { performErrorChecking } from '@/components/editor/error-checking'
import { useCurrentFileStore } from '@/stores/current-file'
import { handleRender } from '@/scripts/handle-render'
import { useRenderDataStore } from '@/stores/render-data'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'

const darkModeStore = useDarkModeStore()
const currentFileStore = useCurrentFileStore()
const previewLoadingStore = usePreviewLoadingStore()
const lastModifiedStore = useLastModifiedStore()
const initStateStore = useInitStateStore()
const renderDataStore = useRenderDataStore()

const { content } = storeToRefs(currentFileStore)

/**
 * The timeout after which the editor will save the text to the local storage.
 *
 * This is used to avoid saving the text too often.
 */
const EDITOR_UPDATE_TIMEOUT = 1000

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

  // Creating the editor with desired theme and language
  editorInstance = monaco.editor.create(editorRef.value, {
    theme: darkModeStore.darkMode ? 'asciiDocDarkTheme' : 'asciiDocLightTheme',
    language: 'asciiDoc',
    value: currentFileStore.content,
    fontFamily: 'JetBrains Mono',
    minimap: {
      enabled: false,
    },
    wordWrap: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  })

  // Error checking on init
  performErrorChecking(editorInstance)

  editorInstance.onDidChangeModelContent((event: editor.IModelContentChangedEvent) => {
    // We will create for every change a new OT operation
    // To do this though we will need to translate the monaco editor changes to OT operations
    // This is simple if we simply assume that empty text means deletion and non-empty text means insertion
    for (const change of event.changes) {
      let ot: OTransReqDto
      if (change.text === '') {
        const length = change.rangeLength
        const pos = change.rangeOffset + length
        ot = currentFileStore.createDeleteOTrans(pos, length)
      } else {
        const pos = change.rangeOffset
        ot = currentFileStore.createInsertOTrans(pos, change.text)
      }
      console.log(ot)
      currentFileStore.pushOTransReq(ot)
    }
  })

  // This is an ID of the timeout
  let activeTimeout: ReturnType<typeof setTimeout>
  editorInstance.onKeyDown((event: monaco.IKeyboardEvent) => {
    // Ensure it was an actual input (printable character)
    if (
      event.keyCode > 0 &&
      ![KeyCode.Backspace, KeyCode.Tab, KeyCode.Enter, KeyCode.Delete, KeyCode.Space].includes(
        event.keyCode,
      ) &&
      (event.keyCode <= KeyCode.DownArrow ||
        (event.keyCode >= KeyCode.Meta && event.keyCode <= KeyCode.ScrollLock))
    ) {
      return
    }
    initStateStore.setFalse()
    previewLoadingStore.setPreviewLoading(true)

    lastModifiedStore.setLastModified(new Date())
    currentFileStore.setContent(editorInstance!.getValue())

    // If there is an active timeout, then cancel it and force the creation of a new one
    // (to avoid saving the text too often)
    if (activeTimeout) clearTimeout(activeTimeout)

    activeTimeout = setTimeout(async () => {
      console.log('[Editor] Broadcasting update')
      const newState = editorInstance!.getValue()
      const renderResp = await handleRender(currentFileStore.fileName, newState)
      renderDataStore.setRenderData(renderResp)
    }, EDITOR_UPDATE_TIMEOUT)
  })

  // Checking for errors when the editor content changes
  editorInstance.onDidChangeModelContent(() => {
    performErrorChecking(editorInstance!)
  })

  // Ensure that the editor content is always in sync with the current file content
  watch(content, newContent => {
    if (editorInstance) {
      editorInstance.setValue(newContent)
    }
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
