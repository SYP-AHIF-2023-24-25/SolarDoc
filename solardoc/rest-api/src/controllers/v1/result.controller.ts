import { inject } from '@loopback/core'
import { CacheService } from '../../services'
import { get, param, Response, RestBindings } from '@loopback/rest'
import { API_PREFIXED_VERSION } from './index'
import { CacheError } from '../../errors'

export class ResultController {
  public static readonly BASE_PATH = `/${API_PREFIXED_VERSION}/result`

  constructor(@inject('services.CacheService') public cacheService: CacheService) {}

  /**
   * Transforms the given file content to a static presentation.
   * @param fileContent The file content to transform
   * @private
   */
  private transformToStaticPresentation(fileContent: string): string {
    // Inject into 'Reveal.initialize' the required options
    return fileContent.replace(
      /(, callback: function \(\) { Reveal.registerPlugin\(RevealNotes\) } }\n {2}],)/g,
      `$1\n
        autoSlide: 0,\n
        controls: false,\n
        keyboard: false,\n
        progress: false,\n
        touch: false,\n
        scrollActivationWidth: null,\n
        slideNumber: false,\n
        history: false,\n`,
    )
  }

  @get(`/${ResultController.BASE_PATH}/{uuid}`, {
    responses: {
      '200': {
        description: 'The file for the specified uuid',
        content: {
          'application/pdf': {
            'x-is-file': true,
            schema: {
              type: 'file',
              format: 'binary',
            },
          },
          'image/png': {
            'x-is-file': true,
            schema: {
              type: 'file',
              format: 'binary',
            },
          },
          'image/jpeg': {
            'x-is-file': true,
            schema: {
              type: 'file',
              format: 'binary',
            },
          },
          'application/octet-stream': {
            'x-is-file': true,
            schema: {
              type: 'file',
              format: 'binary',
            },
          },
          'text/html': {
            'x-is-file': true,
            schema: {
              type: 'string',
              format: 'binary',
            },
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
    @param.query.string('static') $static: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    try {
      const { mimeType, fileContent, originalFilename } = await this.cacheService.getFile(uuid)

      // If the static query parameter is set, transform the file content to a static presentation
      let finalFileContent = fileContent
      if ($static !== undefined && mimeType === 'text/html') {
        finalFileContent = this.transformToStaticPresentation(<string>fileContent)
      }

      // Ensure that the file name is UTF-8 percentage encoded
      const encodedFilename = encodeURIComponent(originalFilename)

      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `inline; filename="${encodedFilename}"`)
      res.status(200).send(finalFileContent)
    } catch (e) {
      if (e instanceof CacheError) {
        res.status(404).send({
          error: 'Specified file not found',
        })
      }
      console.debug(`Failed critically to load file ${uuid} from cache: ${e}`)
      res.status(500).send({
        error: 'Internal server error',
      })
    }
  }
}
