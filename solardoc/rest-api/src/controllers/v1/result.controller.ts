import { inject } from '@loopback/core'
import { CacheService } from '../../services'
import { get, getModelSchemaRef, param, Response, RestBindings } from '@loopback/rest'
import { RenderedPresentationPdfDtoModel } from '../../models'
import { API_PREFIXED_VERSION } from './index'
import { CacheError } from '../../errors'

export class ResultController {
  public static readonly BASE_PATH = `/${API_PREFIXED_VERSION}/result`

  constructor(@inject('services.CacheService') public cacheService: CacheService) {}

  @get(`/${ResultController.BASE_PATH}/{uuid}`, {
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
      '404': {
        description: 'Presentation not found',
      },
    },
  })
  async getCachedResult(
    @param.path.string('uuid') uuid: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    try {
      const { mimeType, fileContent, originalFilename } = await this.cacheService.getFile(uuid)
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`)
      res.status(200).send(fileContent)
    } catch (e) {
      if (e instanceof CacheError) {
        res.status(404).send({
          error: 'Specified file not found',
        })
      }
    }
  }
}
