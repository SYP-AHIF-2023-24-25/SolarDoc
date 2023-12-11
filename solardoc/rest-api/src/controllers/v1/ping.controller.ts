import { inject } from '@loopback/core'
import { get, getModelSchemaRef, Request, RestBindings } from '@loopback/rest'
import { PingDtoModel } from '../../models'
import {API_PREFIXED_VERSION} from "./index";

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  public static readonly BASE_PATH = `/${API_PREFIXED_VERSION}`

  constructor() {}

  @get(`/${PingController.BASE_PATH}/ping`, {
    responses: {
      '200': {
        description: 'Ping Response',
        content: {
          'application/json': { schema: getModelSchemaRef(PingDtoModel) },
        },
      },
    },
  })
  async ping(
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<PingDtoModel> {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: Date.now(),
      url: req.url,
      headers: Object.assign({}, req.headers),
      ip: req.socket.remoteAddress,
    }
  }
}
