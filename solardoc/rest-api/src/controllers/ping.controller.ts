import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  getModelSchemaRef,
} from '@loopback/rest';
import {PingDtoModel} from '../models';

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  @get('/ping', {
    responses: {
      '200': {
        description: 'Ping Response',
        content: {'application/json': {schema: getModelSchemaRef(PingDtoModel)}},
      },
    },
  })
  async ping(): Promise<PingDtoModel> {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: Date.now(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
      ip: this.req.socket.remoteAddress,
    };
  }
}
