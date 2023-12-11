import { RestApiError } from './rest-api-error'

/**
 * Error that is thrown whenever an issue with the Redis db is encountered.
 * @since 0.2.0
 */
export class RedisError extends RestApiError {
  constructor(message?: string) {
    super(message ?? 'An error occurred with the Redis database')
    this.name = 'RedisError'
  }
}
