import type {
  RenderedPresentationRjsHtmlDtoModel,
  RenderPresentationRjsHtmlDtoModel
} from "@/services/backend/gen/backend-rest-service";
import * as backendAPI from "@/services/backend/api-service";
import {usePreviewLoadingStore} from "@/stores/preview-loading";
import {useInitStateStore} from "@/stores/init-state";

const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()

// The reveal.js CDN URL which provides the reveal.js assets
const REVEAL_JS_CDN_URL = 'https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/'

/**
 * Handles a render request by sending it to the backend and returning the download URL.
 * @param fileName The name of the file to render.
 * @param editorContent The content of the editor.
 * @returns The download URL of the rendered presentation.
 */
export async function handleRender(fileName: string, editorContent: string): Promise<string> {
  initStateStore.setFalse()
  previewLoadingStore.setPreviewLoading(true)

  const renderPresentationDtoModel: RenderPresentationRjsHtmlDtoModel = {
    fileName: fileName,
    fileContent: editorContent,
    revealJSAssetsPath: REVEAL_JS_CDN_URL,
  }

  // Send a render request to the backend
  let renderRespObj: RenderedPresentationRjsHtmlDtoModel;
  const renderResp = await backendAPI.postV1RenderPresentationRjsHtml(renderPresentationDtoModel)
  if (renderResp.status === 200) {
    renderRespObj = renderResp.data
  } else {
    throw new Error(`[EditorView] Failed to execute render presentation request:\n${renderResp}`)
  }

  previewLoadingStore.setPreviewLoading(false)
  return renderRespObj.download.downloadURL
}
