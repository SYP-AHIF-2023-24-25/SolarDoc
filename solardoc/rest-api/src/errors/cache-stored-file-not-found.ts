import { CacheError } from './cache-error'

/**
 * Error which is thrown when a file was not found in the cache.
 * @since 0.2.0
 */
export class CacheStoredFileNotFound extends CacheError {
  constructor(message: string) {
    super(message)
    this.name = 'CacheStoredFileNotFound'
  }
}
