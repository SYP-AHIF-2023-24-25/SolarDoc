import { RestApiError } from './rest-api-error'

/**
 * Error which is thrown when a cache error occurs.
 * @since 0.2.0
 */
export class CacheError extends RestApiError {
  constructor(message: string) {
    super(message)
    this.name = 'CacheError'
  }
}
