import {model, property} from "@loopback/repository";
import {IncomingHttpHeaders} from "http";

@model()
export class PingModel {
  @property({
    required: true,
    description: 'The greeting to be returned',
  })
  greeting: string;

  @property({
    required: true,
    description: 'The date of the request (unix timestamp)',
  })
  date: number;

  @property({
    required: true,
    description: 'The url of the request',
  })
  url: string;

  @property({
    required: true,
    description: 'The ip of the request from the client (May be undefined in certain circumstances)',
  })
  ip: string | undefined;

  @property({
    required: true,
    description: 'The headers of the request',
  })
  headers: IncomingHttpHeaders
}
