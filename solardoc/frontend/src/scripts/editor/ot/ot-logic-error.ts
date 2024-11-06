/**
 * Error class for OT logic errors.
 * @since 1.0.0
 */
export class OTLogicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OTLogicError'
  }
}
