/**
 * An error that is thrown when the Phoenix backend service encounters an error.
 * @since 0.4.0
 */
export class PhoenixRestError extends Error {
  constructor(public readonly message: string, public readonly errorCode?: number) {
    super(message);
    this.name = "PhoenixRestError";
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an unexpected error.
 */
export class PhoenixInternalError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = "PhoenixInternalError";
  }
}
