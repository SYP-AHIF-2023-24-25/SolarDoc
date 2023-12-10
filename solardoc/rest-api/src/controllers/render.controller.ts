import { getModelSchemaRef, param, post, requestBody } from '@loopback/rest'
import {
  RenderedPresentationImagesDtoModel,
  RenderedPresentationPdfDtoModel,
  RenderedPresentationRjsHtmlDtoModel,
  RenderedSlideImageDtoModel,
  RenderPresentationDtoModel,
} from '../models'
import { CacheService } from '../services'
import { inject } from '@loopback/core'

/**
 * The controller for managing the render operation of Asciidoc presentations.
 */
export class RenderController {
  constructor(@inject('services.CacheService') public cacheService: CacheService) {}

  @post('/render/presentation/pdf', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as pdf',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationPdfDtoModel),
          },
        },
      },
    },
  })
  async renderPresentationPdf(
    @requestBody() presentationModel: RenderPresentationDtoModel,
  ): Promise<RenderedPresentationPdfDtoModel> {
    throw new Error('Not implemented yet!')
  }

  @post('/render/presentation/rjs-html', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as rjs-html',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationRjsHtmlDtoModel),
          },
        },
      },
    },
  })
  async renderPresentationRjsHtml(
    @requestBody() presentationModel: RenderPresentationDtoModel,
  ): Promise<RenderedPresentationRjsHtmlDtoModel> {
    throw new Error('Not implemented yet!')
  }

  @post('/render/presentation/images', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as images',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationImagesDtoModel),
          },
        },
      },
    },
  })
  async renderPresentationImages(
    @requestBody() presentationModel: RenderPresentationDtoModel,
  ): Promise<RenderedPresentationImagesDtoModel> {
    throw new Error('Not implemented yet!')
  }

  @post('/render/slide/{uuid}/image', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the slide as image',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedSlideImageDtoModel),
          },
        },
      },
    },
  })
  async renderSlideImage(
    @param.path.string('uuid') id: number,
    @requestBody() presentationModel: RenderPresentationDtoModel,
  ): Promise<RenderedSlideImageDtoModel> {
    throw new Error('Not implemented yet!')
  }
}
