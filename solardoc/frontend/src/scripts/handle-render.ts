import type {
  RenderedPresentationRjsHtmlDtoModel,
  RenderPresentationRjsHtmlDtoModel,
} from '@/services/backend/gen/backend-rest-service'
import * as backendAPI from '@/services/backend/api-service'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'

const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()

// The reveal.js CDN URL which provides the reveal.js assets
const REVEAL_JS_CDN_URL = 'https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/'

/**
 * The data returned by the backend when rendering a presentation.
 *
 * This is a subset of the data returned by the backend.
 * @since 0.3.0
 */
export interface RenderedPresentation {
  rawSize: number
  subslideCountPerSlide: number[]
  slideCountInclSubslides: number
  slideCount: number
  previewURL: string
}

/**
 * Handles a render request by sending it to the backend and returning the download URL.
 * @param fileName The name of the file to render.
 * @param editorContent The content of the editor.
 * @returns The download URL of the rendered presentation.
 * @since 0.3.0
 */
export async function handleRender(
  fileName: string,
  editorContent: string,
): Promise<RenderedPresentation> {
  initStateStore.setFalse()
  previewLoadingStore.setPreviewLoading(true)

  const renderPresentationDtoModel: RenderPresentationRjsHtmlDtoModel = {
    fileName: fileName,
    fileContent: editorContent,
    revealJSAssetsPath: REVEAL_JS_CDN_URL,
  }

  // Send a render request to the backend
  let renderRespObj: RenderedPresentationRjsHtmlDtoModel
  const renderResp = await backendAPI.postV1RenderPresentationRjsHtml(renderPresentationDtoModel)
  if (renderResp.status === 200) {
    renderRespObj = renderResp.data
  } else {
    throw new Error(`[EditorView] Failed to execute render presentation request:\n${renderResp}`)
  }

  previewLoadingStore.setPreviewLoading(false)
  return {
    rawSize: renderRespObj.rawSize,
    slideCountInclSubslides: renderRespObj.slideCountInclSubslides,
    slideCount: renderRespObj.slideCount,
    previewURL: renderRespObj.download.downloadURL,
    subslideCountPerSlide: renderRespObj.subslideCountPerSlide,
  } satisfies RenderedPresentation
}
