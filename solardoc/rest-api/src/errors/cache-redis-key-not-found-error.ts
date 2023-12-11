import { CacheError } from './cache-error'

/**
 * Error which is thrown when a specified key was not found in the Redis cache.
 * @since 0.2.0
 */
export class CacheRedisKeyNotFoundError extends CacheError {
  constructor(message: string) {
    super(message)
    this.name = 'CacheRedisKeyNotFoundError'
  }
}
