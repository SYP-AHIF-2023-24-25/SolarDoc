import { SolardocError } from '@/errors/solardoc-error'

export class FileGoneWarn extends SolardocError {
  constructor() {
    super(
      'FileGoneError',
      'The file you are trying to access has been deleted.',
      'File gone',
      'The saved file can not be found.',
      'The file was probably deleted or you do not have the necessary permissions to access it. ' +
        'The content of the file was preserved in the local storage.',
      true,
    )
  }
}
