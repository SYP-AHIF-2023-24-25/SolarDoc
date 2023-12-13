import { Entity, Model, property } from '@loopback/repository'
import { DataObject } from '@loopback/repository/src/common-types'

/**
 * An abstract class which represents an entity which is stored in Redis.
 * @since 0.2.0
 */
export abstract class RedisEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string

  protected constructor(data?: DataObject<Model>) {
    super(data)
  }

  /**
   * Returns the Redis key for this entity. This is in the format of `modelName:id`.
   * @since 0.2.0
   */
  public abstract get redisKey(): string
}
