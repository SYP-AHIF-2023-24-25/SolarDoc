import { AsciidocRendererError } from './AsciidocRendererError'

/**
 * Error thrown when an internal error occurs in the AsciidocRenderer.
 * @since 0.2.0
 */
export class InternalError extends AsciidocRendererError {
  constructor(message: string) {
    super(message)
    this.name = 'InternalError'
  }
}
