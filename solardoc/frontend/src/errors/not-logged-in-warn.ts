import {SolardocError} from '@/errors/solardoc-error'

export class NotLoggedInWarn extends SolardocError {
  constructor() {
    super(
      'NotLoggedInError',
      'You must be logged in to access this page.',
      'Not logged in',
      'You must be logged in to access this page.',
      'Please log in to access this page.',
      true,
    )
  }
}
