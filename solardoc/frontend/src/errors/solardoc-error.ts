/**
 * Interface for errors that can be displayed to the user.
 * @since 0.6.0
 */
export interface NotifiableError {
  notifName: string,
  notifMessage: string,
  notifDescription: string,
}

/**
 * Custom error class for all Solardoc errors.
 * @since 0.6.0
 */
export class SolardocError extends Error implements NotifiableError {
  constructor(
    public name: string,
    public message: string,
    public notifName: string,
    public notifMessage: string,
    public notifDescription: string,
  ) {
    super(message)
    this.name = name ?? 'SolardocError'
    this.message = message
  }
}
