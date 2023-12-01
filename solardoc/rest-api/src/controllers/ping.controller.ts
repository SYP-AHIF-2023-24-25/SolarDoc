import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject, getModelSchemaRef,
} from '@loopback/rest';
import {PingModel} from "../models/ping.model";

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  @get(
    '/ping',
    {
      responses: {
        '200': {
          description: 'Ping Response',
          content: {schema: getModelSchemaRef(PingModel)},
        }
      }
    }
  )
  async ping(): Promise<PingModel> {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: Date.now(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
      ip: this.req.socket.remoteAddress
    };
  }
}
