import { getModelSchemaRef, param, post, Request, requestBody, RestBindings } from '@loopback/rest'
import {
  RenderedPresentationImagesDtoModel,
  RenderedPresentationPdfDtoModel,
  RenderedPresentationRjsHtmlDtoModel,
  RenderedSlideImageDtoModel,
  RenderPresentationDtoModel,
} from '../../models'
import { CacheService, RenderService } from '../../services'
import { inject } from '@loopback/core'
import { HTMLOutput } from '@solardoc/asciidoc-renderer'
import { API_PREFIXED_VERSION, ResultController } from './index'
import { buildAPIURL } from '../../utils'
import {RenderPresentationRjsHtmlDtoModel} from "../../models/dto/render-presentation-rjs-html-dto.model";

/**
 * The controller for managing the ${RenderController.BASE_PATH} operation of Asciidoc presentations.
 */
export class RenderController {
  public static readonly BASE_PATH = `/${API_PREFIXED_VERSION}/render`

  constructor(
    @inject('services.CacheService') public cacheService: CacheService,
    @inject('services.RenderService') public renderService: RenderService,
  ) {}

  /**
   * Ensures that the host header is present in the request.
   *
   * This is to make sure that unsupported environments don't get through.
   * @param req The request to check the host header for.
   * @private
   * @since 0.4.0
   */
  private _ensureHostHeader(req: Request): string {
    const hostHeader = req.headers.host
    if (hostHeader === undefined) {
      throw new Error('Host header is missing. Client may be using HTTP 1.0, HTTP >=1.1 is required!')
    }
    return hostHeader
  }

  @post(`/${RenderController.BASE_PATH}/presentation/pdf`, {
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

  @post(`/${RenderController.BASE_PATH}/presentation/rjs-html`, {
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
    @requestBody() presentationModel: RenderPresentationRjsHtmlDtoModel,
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<RenderedPresentationRjsHtmlDtoModel> {
    this._ensureHostHeader(req)
    const htmlOutput: HTMLOutput = await this.renderService.renderRJSHTMLPresentation(
      presentationModel.fileName,
      presentationModel.fileContent,
      presentationModel.revealJSAssetsPath,
    )

    // Write out the file and save it to the cache
    const content: string = await htmlOutput.write()
    const cachedElement = await this.cacheService.addFile(htmlOutput.outFilename, content)

    // Build the download URL where the user can download the file
    const downloadURL: string = buildAPIURL(req, ResultController.BASE_PATH, cachedElement.id)
    console.log(downloadURL)
    console.log(req)
    return {
      fileName: presentationModel.fileName, // Original filename
      cache: cachedElement.toCacheDtoModel(),
      download: cachedElement.toDownloadDtoModel(downloadURL),
      rawSize: htmlOutput.presentation.sourceFile.getFileSize('KB'),
      slideCount: htmlOutput.presentation.metadata.slideCount,
      slideCountInclSubslides: htmlOutput.presentation.metadata.slideCountInclSubslides,
      subslideCountPerSlide: htmlOutput.presentation.metadata.subslideCountPerSlide,
    }
  }

  @post(`/${RenderController.BASE_PATH}/presentation/images`, {
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
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<RenderedPresentationImagesDtoModel> {
    this._ensureHostHeader(req)
    throw new Error('Not implemented yet!')
  }

  @post(`/${RenderController.BASE_PATH}/slide/{uuid}/image`, {
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
    @inject(RestBindings.Http.REQUEST) req: Request,
    @requestBody() presentationModel: RenderPresentationDtoModel,
  ): Promise<RenderedSlideImageDtoModel> {
    this._ensureHostHeader(req)
    throw new Error('Not implemented yet!')
  }
}
