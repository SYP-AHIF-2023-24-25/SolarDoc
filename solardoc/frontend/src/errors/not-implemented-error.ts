import { SolardocError } from '@/errors/solardoc-error'

/**
 * Error class for development or experimental features not being implemented.
 * @since 1.0.0
 */
export class SolardocNotImplementedError extends SolardocError {
  constructor(
    message: string = 'This feature is not implemented yet.',
    description: string = 'This feature is not implemented yet. Please check back later for updates.',
  ) {
    super('SolardocNotImplementedError', message, 'Not Implemented', message, description)
  }
}
