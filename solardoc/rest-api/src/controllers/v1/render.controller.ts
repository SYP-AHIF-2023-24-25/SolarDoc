import { getModelSchemaRef, param, post, Request, requestBody, RestBindings } from '@loopback/rest'
import {
  CacheDtoModel,
  DownloadDtoModel,
  RenderedPresentationImagesDtoModel,
  RenderedPresentationPdfDtoModel,
  RenderedPresentationRjsHtmlDtoModel,
  RenderedSlideImageDtoModel,
  RenderPresentationDtoModel,
} from '../../models'
import { CacheService, RenderService } from '../../services'
import { inject } from '@loopback/core'
import { HTMLOutput, ImageOutput, PDFOutput } from '@solardoc/asciidoc-renderer'
import { API_PREFIXED_VERSION, ResultController } from './index'
import { buildAPIURL } from '../../utils'

/**
 * The controller for managing the ${RenderController.BASE_PATH} operation of Asciidoc presentations.
 */
export class RenderController {
  public static readonly BASE_PATH = `/${API_PREFIXED_VERSION}/render`

  constructor(
    @inject('services.CacheService') public cacheService: CacheService,
    @inject('services.RenderService') public renderService: RenderService,
  ) {}

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
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<RenderedPresentationPdfDtoModel> {
    const pdfOutput: PDFOutput = await this.renderService.renderPDF(
      presentationModel.fileName,
      presentationModel.fileContent,
      presentationModel.revealJSAssetsPath,
    )

    const content: Uint8Array = await pdfOutput.write()
    const cachedElement = await this.cacheService.addFile(pdfOutput.outFilename, content)

    // Build the download URL where the user can download the file
    const downloadURL: string = buildAPIURL(req, ResultController.BASE_PATH, cachedElement.id)

    return {
      fileName: presentationModel.fileName, // Original filename
      cache: cachedElement.toCacheDtoModel(),
      download: cachedElement.toDownloadDtoModel(downloadURL),
      rawSize: pdfOutput.presentation.sourceFile.getFileSize('KB'),
      slideCount: pdfOutput.presentation.metadata.slideCount,
      slideCountInclSubslides: pdfOutput.presentation.metadata.slideCountInclSubslides,
      subslideCountPerSlide: pdfOutput.presentation.metadata.subslideCountPerSlide,
    }
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
    @requestBody() presentationModel: RenderPresentationDtoModel,
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<RenderedPresentationRjsHtmlDtoModel> {
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
    const imageOutput: ImageOutput = await this.renderService.renderImage(
      presentationModel.fileName,
      presentationModel.fileContent,
      presentationModel.revealJSAssetsPath,
    )

    const downloadModels: Record<number, DownloadDtoModel> = {}
    const cacheModels : Record<number, CacheDtoModel> = {}
    const content: Buffer[] = await imageOutput.write()
    for (let i = 0; i < content.length; i++) {
      const cachedElement = await this.cacheService.addFile(imageOutput.outFilename, content[i])
      const downloadURL: string = buildAPIURL(req, ResultController.BASE_PATH, cachedElement.id)
      downloadModels[i] = cachedElement.toDownloadDtoModel(downloadURL)
      cacheModels[i] = cachedElement.toCacheDtoModel()
    }

    return {
      fileName: presentationModel.fileName, // Original filename
      cache: cacheModels,
      download: downloadModels,
      rawSize: imageOutput.presentation.sourceFile.getFileSize('KB'),
      slideCount: imageOutput.presentation.metadata.slideCount,
      slideCountInclSubslides: imageOutput.presentation.metadata.slideCountInclSubslides,
      subslideCountPerSlide: imageOutput.presentation.metadata.subslideCountPerSlide,
    }
  }

  @post(`/${RenderController.BASE_PATH}/slide/{id}/image`, {
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
    @param.path.string('id') id: number,
    @requestBody() presentationModel: RenderPresentationDtoModel,
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<RenderedSlideImageDtoModel> {
    const imageOutput: ImageOutput = await this.renderService.renderImage(
      presentationModel.fileName,
      presentationModel.fileContent,
      presentationModel.revealJSAssetsPath,
      id,
    )

    const content: Buffer[] = await imageOutput.write()
    const cachedElement = await this.cacheService.addFile(imageOutput.outFilename, content[0])

    // Build the download URL where the user can download the file
    const downloadURL: string = buildAPIURL(req, ResultController.BASE_PATH, cachedElement.id)

    return {
      fileName: presentationModel.fileName, // Original filename
      cache: cachedElement.toCacheDtoModel(),
      download: cachedElement.toDownloadDtoModel(downloadURL),
    }
  }
}
