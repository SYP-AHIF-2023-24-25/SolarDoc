import {SolardocError} from "@/errors/solardoc-error";

/**
 * Error class for when the Solardoc API is unreachable.
 * @since 0.6.0
 */
export class SolardocUnreachableError extends SolardocError {
  constructor(message: string, description?: string) {
    super(
      'SolardocUnreachableError',
      message,
      'Network Error',
      message,
      description ?? `Please check your internet connection and try again. If the problem persists, the service may be down.`,
    )
  }
}
