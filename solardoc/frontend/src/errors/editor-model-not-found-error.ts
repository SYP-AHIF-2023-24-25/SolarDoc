import {SolardocError} from "@/errors/solardoc-error";

/**
 * An error that is thrown when the editor model could not be found. This is a critical runtime error.
 * @since 0.7.0
 */
export class EditorModelNotFoundError extends SolardocError {
  constructor() {
    super(
      'EditorModelNotFoundError',
      'Editor model not found',
      'Editor model not found',
      'The editor model could not be found. Please try again.',
      'Please reload the page and if the error persists, contact the developers.',
      false,
    )
  }
}
