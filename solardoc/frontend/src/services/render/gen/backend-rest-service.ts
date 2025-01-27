/**
 * @solardoc/rest-api
 * 1.0.0-beta.2
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from 'oazapfts/lib/runtime'
import * as QS from 'oazapfts/lib/runtime/query'

export const defaults: Oazapfts.RequestOpts = {
  baseUrl: '/',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  server1: '/',
}
export type PingDtoModel = {
  greeting: string
  date: number
  url: string
  ip: object
  headers: object
}
export type RenderPresentationDtoModel = {
  fileName: string
  fileContent: string
  revealJSAssetsPath?: string
}
export type RenderedPresentationImagesDtoModel = {
  fileName: string
  rawSize: number
  slideCount: number
  slideCountInclSubslides: number
  subslideCountPerSlide: number[]
  download: object
  cache: object
}
export type CacheDtoModel = {
  cacheUUID: string
  expiresAt: number
}
export type DownloadDtoModel = {
  downloadURL: string
  fileName: string
}
export type RenderedPresentationPdfDtoModel = {
  fileName: string
  rawSize: number
  slideCount: number
  slideCountInclSubslides: number
  subslideCountPerSlide: number[]
  cache: CacheDtoModel
  download: DownloadDtoModel
}
export type RenderedPresentationRjsHtmlDtoModel = {
  fileName: string
  rawSize: number
  slideCount: number
  slideCountInclSubslides: number
  subslideCountPerSlide: number[]
  cache: CacheDtoModel
  download: DownloadDtoModel
}
export type RenderedSlideImageDtoModel = {
  fileName: string
  cache: CacheDtoModel
  download: DownloadDtoModel
}

export function getV1Ping(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200
    data: PingDtoModel
  }>('/v1/ping', {
    ...opts,
  })
}

export function postV1RenderPresentationImages(
  renderPresentationDtoModel?: RenderPresentationDtoModel,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200
    data: RenderedPresentationImagesDtoModel
  }>(
    '/v1/render/presentation/images',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: renderPresentationDtoModel,
    }),
  )
}

export function postV1RenderPresentationPdf(
  renderPresentationDtoModel?: RenderPresentationDtoModel,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200
    data: RenderedPresentationPdfDtoModel
  }>(
    '/v1/render/presentation/pdf',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: renderPresentationDtoModel,
    }),
  )
}

export function postV1RenderPresentationRjsHtml(
  renderPresentationDtoModel?: RenderPresentationDtoModel,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200
    data: RenderedPresentationRjsHtmlDtoModel
  }>(
    '/v1/render/presentation/rjs-html',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: renderPresentationDtoModel,
    }),
  )
}

export function postV1RenderSlideByIdImage(
  id: string,
  renderPresentationDtoModel?: RenderPresentationDtoModel,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200
    data: RenderedSlideImageDtoModel
  }>(
    `/v1/render/slide/${encodeURIComponent(id)}/image`,
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: renderPresentationDtoModel,
    }),
  )
}

export function getV1ResultByUuid(
  uuid: string,
  {
    $static,
  }: {
    $static?: string
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/v1/result/${encodeURIComponent(uuid)}${QS.query(
      QS.explode({
        static: $static,
      }),
    )}`,
    {
      ...opts,
    },
  )
}
