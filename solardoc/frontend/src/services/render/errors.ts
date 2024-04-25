import { SolardocError } from '@/errors/solardoc-error'

/**
 * An error that is thrown when the backend render service encounters an error.
 * @since 0.6.0
 */
export class RenderBackendRestError extends SolardocError {
  constructor(
    public readonly message: string,
    public readonly errorCode?: number,
    public readonly errorDescription?: string,
    public readonly name: string = 'PhoenixRestError',
  ) {
    super(
      name,
      message,
      'Error',
      `${message} (Code: ${errorCode ?? 'Unknown'})`,
      errorDescription ?? 'No description provided. Check the console for more information.',
    )
  }
}

/**
 * An error that is thrown when an unexpected error is encountered.
 * @since 0.6.0
 */
export class RenderBackendRestUnknownError extends RenderBackendRestError {
  constructor(
    public readonly message: string,
    public readonly errorCode?: number,
  ) {
    super(message, errorCode, 'Unknown error. Checks logs for more information')
  }
}
