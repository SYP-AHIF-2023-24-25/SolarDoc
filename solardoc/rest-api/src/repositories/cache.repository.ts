import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { RedisDBDataSource } from '../datasources'
import { CachedElement, CachedElementRelations } from '../models'
import { CacheError } from '../errors'
import { v4 as uuidV4 } from 'uuid'

/**
 * A type alias for a UUID.
 * @since 0.2.0
 */
export type UUIDV4 = ReturnType<typeof uuidV4>

/**
 * A repository for managing cached elements using Redis.
 * @since 0.2.0
 */
export class CacheRepository extends DefaultCrudRepository<
  CachedElement,
  typeof CachedElement.prototype.uuid,
  CachedElementRelations
> {
  public override dataSource: RedisDBDataSource

  constructor(@inject('datasources.redisdb') dataSource: RedisDBDataSource) {
    super(CachedElement, dataSource)
  }

  /**
   * Get the Redis client from the {@link RedisDBDataSource dataSource}.
   * @since 0.2.0
   */
  public get v4RedisClient(): typeof RedisDBDataSource.prototype.v4Client {
    return this.dataSource.v4Client
  }

  public async setCacheExpiration(cachedElement: CachedElement, throwOnError: true): Promise<void>
  public async setCacheExpiration(
    cachedElement: CachedElement,
    throwOnError: false,
  ): Promise<boolean>

  /**
   * Set the expiration date for a cached element.
   * @param cachedElement The element to set the expiration date for.
   * @param throwOnError Whether to throw an error if the expiration date could not be set.
   */
  public async setCacheExpiration(
    cachedElement: CachedElement,
    throwOnError: boolean,
  ): Promise<void | boolean> {
    if (!cachedElement.id) {
      throw new CacheError('Cannot set expiration date for cached element without UUID')
    }

    const result: boolean = await this.v4RedisClient.expireAt(
      cachedElement.redisKey,
      cachedElement.expiresAt,
    )
    if (!result && throwOnError) {
      throw new CacheError(
        `Could not set expiration date for cached element with UUID ${cachedElement.id}`,
      )
    } else {
      return result
    }
  }

  /**
   * Generates a new UUID for a cached element.
   * @since 0.2.0
   */
  public genNewCacheUUID(): UUIDV4 {
    return uuidV4()
  }
}
