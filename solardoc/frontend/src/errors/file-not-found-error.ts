import { SolardocError } from '@/errors/solardoc-error'

/**
 * Error class for when a file is not found in the Kipper system.
 * @since 1.0.0
 */
export class KipperFileNotFoundError extends SolardocError {
  constructor(
    message: string = 'The requested file was not found.',
    description: string = 'The file you are looking for does not exist or has been moved. Please check the file path and try again.',
  ) {
    super('KipperFileNotFoundError', message, 'File Not Found', message, description)
  }
}
