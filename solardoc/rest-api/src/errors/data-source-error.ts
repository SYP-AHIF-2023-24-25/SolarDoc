import { RestApiError } from './rest-api-error'

/**
 * An error that occurs when an issue appears with a data source.
 * @since 0.2.0
 */
export class DataSourceError extends RestApiError {
  constructor(message?: string) {
    super(message || 'An error occurred with a data source.')
    this.name = 'DataSourceError'
  }
}
