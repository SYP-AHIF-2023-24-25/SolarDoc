import {getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {RenderPresentationModel} from '../models/render-presentation.model';
import {RenderedPresentationPdfModel} from '../models/rendered-presentation-pdf.model';
import {RenderedPresentationRjsHtmlModel} from '../models/rendered-presentation-rjs-html.model';
import {RenderedPresentationImagesModel} from '../models/rendered-presentation-images.model';
import {RenderedSlideImageModel} from '../models/rendered-slide-image.model';

/**
 * The controller for managing the render operation of Asciidoc presentations.
 */
export class RenderController {
  @post('/render/presentation/pdf', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as pdf',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationPdfModel),
          },
        },
      },
    },
  })
  async renderPresentationPdf(
    @requestBody() presentationModel: RenderPresentationModel,
  ): Promise<RenderedPresentationPdfModel> {
    throw new Error('Not implemented yet!');
  }

  @post('/render/presentation/rjs-html', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as rjs-html',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationRjsHtmlModel),
          },
        },
      },
    },
  })
  async renderPresentationRjsHtml(
    @requestBody() presentationModel: RenderPresentationModel,
  ): Promise<RenderedPresentationRjsHtmlModel> {
    throw new Error('Not implemented yet!');
  }

  @post('/render/presentation/images', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the presentation as images',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedPresentationImagesModel),
          },
        },
      },
    },
  })
  async renderPresentationImages(
    @requestBody() presentationModel: RenderPresentationModel,
  ): Promise<RenderedPresentationImagesModel> {
    throw new Error('Not implemented yet!');
  }

  @post('/render/slide/{uuid}/image', {
    responses: {
      '200': {
        description:
          'Object containing the metadata and the download object for downloading the slide as image',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RenderedSlideImageModel),
          },
        },
      },
    },
  })
  async renderSlideImage(
    @param.path.string('uuid') id: number,
    @requestBody() presentationModel: RenderPresentationModel,
  ): Promise<RenderedSlideImageModel> {
    throw new Error('Not implemented yet!');
  }
}
