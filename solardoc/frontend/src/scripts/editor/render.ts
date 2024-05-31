import {interceptErrors} from '@/errors/handler/error-handler'
import {handleRender} from '@/scripts/handle-render'
import {useRenderDataStore} from '@/stores/render-data'
import {editor} from 'monaco-editor'
import {useCurrentFileStore} from '@/stores/current-file'

const renderDataStore = useRenderDataStore()
const currentFileStore = useCurrentFileStore()

/**
 * The timeout after which the editor will save the text to the local storage.
 *
 * This is used to avoid saving the text too often.
 */
const EDITOR_UPDATE_TIMEOUT = 1000

let activeTimeout: ReturnType<typeof setTimeout> | undefined = undefined

export async function triggerPreviewRerender(editorInstance: editor.IStandaloneCodeEditor) {
  // If there is an active timeout, then cancel it and force the creation of a new one
  // (to avoid saving the text too often)
  if (activeTimeout) clearTimeout(activeTimeout)

  activeTimeout = setTimeout(async () => {
    console.log('[editor/render.ts] Rendering new preview')
    const newState = editorInstance.getValue()
    const renderResp = await interceptErrors(handleRender(currentFileStore.fileName, newState))
    renderDataStore.setRenderData(renderResp)
  }, EDITOR_UPDATE_TIMEOUT)
}
