import { AsciidocRendererError } from './asciidoc-renderer-error'

/**
 * An error that is thrown when the environment is not supported.
 * @since 0.2.0
 */
export class InvalidEnvError extends AsciidocRendererError {
  public constructor(message: string) {
    super(message)
    this.name = 'InvalidEnvError'
  }
}
