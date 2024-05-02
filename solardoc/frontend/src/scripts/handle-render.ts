import type { RenderPresentationDtoModel } from '@/services/render/gen/backend-rest-service'
import * as backendAPI from '@/services/render/api-service'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import { SolardocUnreachableError } from '@/errors/unreachable-error'
import { RenderBackendRestUnknownError } from '@/services/render/errors'

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
 * @param content The content of the editor.
 * @returns The download URL of the rendered presentation.
 * @since 0.3.0
 */
export async function handleRender(
  fileName: string,
  content: string,
): Promise<RenderedPresentation> {
  initStateStore.setFalse()
  previewLoadingStore.setPreviewLoading(true)

  const renderPresentationDtoModel: RenderPresentationDtoModel = {
    fileName: fileName,
    fileContent: content,
    revealJSAssetsPath: REVEAL_JS_CDN_URL,
  }
  let error: Error | undefined = undefined
  let renderResp:
    | Awaited<ReturnType<typeof backendAPI.postV1RenderPresentationRjsHtml>>
    | undefined = undefined
  try {
    renderResp = await backendAPI.postV1RenderPresentationRjsHtml(renderPresentationDtoModel)
  } catch (e) {
    error = <Error>e
  }
  if (
    error instanceof TypeError &&
    error.message.includes('NetworkError when attempting to fetch resource')
  ) {
    throw new SolardocUnreachableError(
      'Encountered network error during render request to the backend',
    )
  } else if (!renderResp || renderResp.status !== 200) {
    throw new RenderBackendRestUnknownError(
      'Failed to render presentation due to unknown error',
      renderResp?.status,
    )
  }

  previewLoadingStore.setPreviewLoading(false)
  return {
    rawSize: renderResp.data.rawSize,
    slideCountInclSubslides: renderResp.data.slideCountInclSubslides,
    slideCount: renderResp.data.slideCount,
    previewURL: renderResp.data.download.downloadURL,
    subslideCountPerSlide: renderResp.data.subslideCountPerSlide,
  } satisfies RenderedPresentation
}
