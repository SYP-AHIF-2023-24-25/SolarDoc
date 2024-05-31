<script setup lang="ts">
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import type { OTrans } from '@/services/phoenix/ot-trans'
import { onMounted, ref, type Ref, watch } from 'vue'
import { storeToRefs, type SubscriptionCallbackMutation } from 'pinia'
import { lightEditorTheme } from './monaco-config/light-editor-theme'
import { darkEditorTheme } from './monaco-config/dark-editor-theme'
import { useDarkModeStore } from '@/stores/dark-mode'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import { performErrorChecking } from '@/components/editor/error-checking'
import { Permissions, useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentUserStore } from '@/stores/current-user'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'
import { triggerRerender } from '@/components/editor/render'
import { createOTUpdates } from '@/components/editor/ot/create-ot'
import {getMonacoUpdatesFromOT} from "@/components/editor/ot/get-monaco-updates";
import {sendOTUpdates} from "@/components/editor/ot/send-ot";

const darkModeStore = useDarkModeStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

const { lastTrans } = storeToRefs(currentFileStore)

// Editor update lock and states
const locked = ref(false)
const waiting = ref<ReturnType<typeof setTimeout> | undefined>(undefined)

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

  if (currentFileStore.permissions === Permissions.Read) {
    editorInstance!.updateOptions({
      readOnly: true,
    })
  }

  // Error checking on init
  performErrorChecking(editorInstance)

  editorInstance.onDidChangeModelContent(async (event: editor.IModelContentChangedEvent) => {
    // We always trigger the re-render of the preview when the editor content changes
    previewLoadingStore.setPreviewLoading(true)
    initStateStore.setFalse()
    await triggerRerender(editorInstance!)

    // If the editor is locked, then the server has sent an update, and we are currently updating the editor
    // This means this update is not user input, and we should not send it to the server
    if (locked.value) {
      return
    }

    currentFileStore.resetLastModified()
    const changeOTUpdates = await createOTUpdates(event.changes)
    for (const singleChangeOTs of changeOTUpdates) {
      await sendOTUpdates(singleChangeOTs, editorUpdateWSClient.hasActiveChannelConnection)
    }
  })

  // Checking for errors when the editor content changes, which are then highlighted to the user
  editorInstance.onDidChangeModelContent(() => {
    performErrorChecking(editorInstance!)
  })

  // Ensure that the editor content is always in sync with the current file content
  const setLocked = (value: boolean) => {
    locked.value = value
    editorInstance!.updateOptions({ readOnly: value })
  }
  const handleUpdate = async (oTrans: OTrans | undefined) => {
    const model = editorInstance!.getModel()
    if (!model || oTrans === undefined) {
      return
    } else if (oTrans.init) {
      // The init transformation should not be applied and only the init content should be set
      setLocked(true)
      model.setValue(currentFileStore.content)
      setLocked(false)
      return
    } else if (oTrans.user_id == currentUserStore.currentUser!.id) {
      // The transformation was made by the current user, so we don't need to apply it
      return
    } else if (locked.value) {
      if (waiting.value) {
        clearTimeout(waiting.value)
      }
      // @ts-ignore Weird mystery error (setTimeout return is first a number, now it's a Timeout for some reason. We
      // can't handle that here, so we'll just ignore it)
      waiting.value = setTimeout(handleUpdate, 100)
    }

    setLocked(true)
    // const cursorPos = editorInstance!.getPosition()
    const edits = getMonacoUpdatesFromOT(model, oTrans)
    model.applyEdits(edits)

    // To ensure that the cursor position is not lost, we will set it after the update
    // if (cursorPos) {
    //   editorInstance!.setPosition(cursorPos)
    // }
    setLocked(false)
  }
  watch(lastTrans, handleUpdate)

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

<template>
  <div id="editor" ref="editorRef"></div>
</template>

<style scoped>
#editor {
  width: 50vw;
  height: 100vh;
}
</style>
