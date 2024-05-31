import {SolardocError} from '@/errors/solardoc-error'

/**
 * An error that is thrown when the editor element could not be found. This is a critical initialisation error.
 * @since 0.7.0
 */
export class EditorElementNotFoundError extends SolardocError {
  constructor() {
    super(
      'EditorElementNotFoundError',
      'Editor element not found',
      'Editor element not found',
      'The editor element could not be found. Please try again.',
      'Please reload the page and if the error persists, contact the developers.',
      false,
    )
  }
}
