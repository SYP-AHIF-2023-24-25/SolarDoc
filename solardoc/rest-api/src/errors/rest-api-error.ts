/**
 * Default error class for REST API errors.
 * @since 0.2.0
 */
export class RestApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RestAPIError'
  }
}
