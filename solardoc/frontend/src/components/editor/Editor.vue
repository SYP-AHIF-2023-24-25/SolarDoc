<script setup lang="ts">
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { OTrans, OTransReqDto } from '@/services/phoenix/ot-trans'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { onMounted, ref, type Ref, watch } from 'vue'
import { storeToRefs, type SubscriptionCallbackMutation } from 'pinia'
import { lightEditorTheme } from './monaco-config/light-editor-theme'
import { darkEditorTheme } from './monaco-config/dark-editor-theme'
import { useDarkModeStore } from '@/stores/dark-mode'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import { KeyCode } from 'monaco-editor'
import { performErrorChecking } from '@/components/editor/error-checking'
import { useCurrentFileStore } from '@/stores/current-file'
import { handleRender } from '@/scripts/handle-render'
import { useRenderDataStore } from '@/stores/render-data'
import { handleOutgoingUpdate } from '@/scripts/handle-ot'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentUserStore } from '@/stores/current-user'
import { interceptErrors } from '@/errors/error-handler'
import { Permissions } from '@/stores/current-file'
import asciiDocLangMonarch from './monaco-config/asciidoc-lang-monarch'

const darkModeStore = useDarkModeStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()
const renderDataStore = useRenderDataStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

const { lastTrans } = storeToRefs(currentFileStore)

// Editor update lock and states
const locked = ref(false)
const waiting = ref<ReturnType<typeof setTimeout> | undefined>(undefined)

/**
 * The timeout after which the editor will save the text to the local storage.
 *
 * This is used to avoid saving the text too often.
 */
const EDITOR_UPDATE_TIMEOUT = 1000

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
const editorRef = <Ref<HTMLElement>>ref(document.querySelector('#editor'))

function calculateUpdates(
  model: monaco.editor.ITextModel,
  oTrans: OTrans,
): Array<editor.IIdentifiedSingleEditOperation> {
  const edits: Array<editor.IIdentifiedSingleEditOperation> = []

  // We need to translate the single dimension OT operation to monaco editor edits using ranges
  // We will need to split the operation into multiple operations if it spans multiple lines
  if (oTrans.trans.type === 'insert') {
    const position = model.getPositionAt(oTrans.trans.pos)
    edits.push({
      range: new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      ),
      text: oTrans.trans.content,
      forceMoveMarkers: true,
    })
  } else {
    const start = model.getPositionAt(oTrans.trans.pos - oTrans.trans.length)
    const end = model.getPositionAt(oTrans.trans.pos)

    if (start.lineNumber === end.lineNumber) {
      edits.push({
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        text: null,
      })
    } else {
      for (let lineNumber = start.lineNumber; lineNumber <= end.lineNumber; lineNumber++) {
        let startColumn = lineNumber === start.lineNumber ? start.column : 1
        let endColumn =
          lineNumber === end.lineNumber ? end.column : model.getLineMaxColumn(lineNumber)

        let startLineNumber = lineNumber
        let endLineNumber = lineNumber

        // We also need to make sure if the line is completely deleted, we need to also delete the newline character
        // We do this by checking if the line is not the first line and the start column is 1
        if (lineNumber !== start.lineNumber && startColumn === 1) {
          startLineNumber--
          startColumn = model.getLineMaxColumn(startLineNumber)
        }

        edits.push({
          range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
          text: null,
        })
      }
    }
  }
  return edits
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

  // Fix font sizing related issues (See #146 for details)
  document.fonts.ready.then(() => {
    monaco.editor.remeasureFonts()
    editorInstance!.render()
  })

  if (currentFileStore.permissions === Permissions.Read) {
    editorInstance!.updateOptions({
      readOnly: true,
    })
  }

  // Error checking on init
  performErrorChecking(editorInstance)

  editorInstance.onDidChangeModelContent(async (event: editor.IModelContentChangedEvent) => {
    // We don't do anything without any channel connection
    if (!editorUpdateWSClient.hasActiveChannelConnection) {
      return
    }

    // If the editor is locked, then the server has sent an update and we are currently updating the editor
    // This means this update is not user input and we should not send it to the server
    if (locked.value) {
      return
    }

    // We will create for every change a new OT operation
    // To do this though we will need to translate the monaco editor changes to OT operations
    // This is simple if we simply assume that empty text means deletion and non-empty text means insertion
    for (const change of event.changes) {
      const ot: Array<OTransReqDto> = []
      if (change.text === '') {
        const length = change.rangeLength
        const pos = change.rangeOffset + length
        ot.push(currentFileStore.createDeleteOTrans(pos, length))
      } else {
        const pos = change.rangeOffset
        // Check if we potentially deleted text using the insert operation
        if (change.rangeLength > 0) {
          const length = change.rangeLength
          const pos = change.rangeOffset + length
          ot.push(currentFileStore.createDeleteOTrans(pos, length))
        }
        ot.push(currentFileStore.createInsertOTrans(pos, change.text))
      }
      for (const oTrans of ot) {
        console.debug(`[Editor] Pushing OT operation:`, ot)
        await handleOutgoingUpdate(oTrans)
      }
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

    currentFileStore.resetLastModified()
    currentFileStore.setContent(editorInstance!.getValue())

    // If there is an active timeout, then cancel it and force the creation of a new one
    // (to avoid saving the text too often)
    if (activeTimeout) clearTimeout(activeTimeout)

    activeTimeout = setTimeout(async () => {
      console.log('[Editor] Broadcasting update')
      const newState = editorInstance!.getValue()
      const renderResp = await interceptErrors(handleRender(currentFileStore.fileName, newState))
      renderDataStore.setRenderData(renderResp)
    }, EDITOR_UPDATE_TIMEOUT)
  })

  // Checking for errors when the editor content changes
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
    const edits = calculateUpdates(model, oTrans)
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
