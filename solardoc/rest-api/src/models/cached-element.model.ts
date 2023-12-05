import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class CachedElement extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  expiresAt: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  serverPath: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  uuid?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<CachedElement>) {
    super(data);
  }
}

export interface CachedElementRelations {
  // describe navigational properties here
}

export type CachedElementWithRelations = CachedElement & CachedElementRelations;
