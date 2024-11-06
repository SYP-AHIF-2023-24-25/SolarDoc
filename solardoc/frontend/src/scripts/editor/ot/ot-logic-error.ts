export class OTLogicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OTLogicError'
  }
}
