import { model, property } from '@loopback/repository'
import { RedisEntity } from './abstract/redis-entity'

@model({ settings: { strict: false } })
export class CachedElement extends RedisEntity {
  @property({
    type: 'number',
    required: true,
  })
  expiresAt: number

  @property({
    type: 'string',
    required: true,
  })
  name: string

  @property({
    type: 'string',
    required: true,
  })
  serverPath: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any

  /**
   * Create a new cached element.
   * @param data The data to create the cached element from. (Ignores any {@link CachedElement.uuid} property, as this
   * is auto-generated.)
   */
  constructor(data?: Partial<CachedElement>) {
    super(data)
  }

  /**
   * Returns whether this cached element has expired.
   * @since 0.2.0
   */
  public hasExpired(): boolean {
    return this.expiresAt <= Date.now()
  }

  public override get redisKey(): string {
    return `${CachedElement.modelName}:${this.id}`
  }
}

export interface CachedElementRelations {
  // describe navigational properties here
}

export type CachedElementWithRelations = CachedElement & CachedElementRelations
