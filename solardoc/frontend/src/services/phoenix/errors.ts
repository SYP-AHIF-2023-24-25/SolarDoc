/**
 * An error that is thrown when the Phoenix backend service encounters an error.
 * @since 0.4.0
 */
export class PhoenixRestError extends Error {
  constructor(
    public readonly message: string,
    public readonly errorCode?: number,
  ) {
    super(message)
    this.name = 'PhoenixRestError'
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an unexpected error.
 * @since 0.4.0
 */
export class PhoenixInternalError extends Error {
  constructor(public readonly message: string) {
    super(message)
    this.name = 'PhoenixInternalError'
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an invalid operation.
 * @since 0.4.0
 */
export class PhoenixInvalidOperationError extends PhoenixInternalError {
  constructor(public readonly message: string) {
    super(message)
    this.name = 'PhoenixInvalidOperationError'
  }
}

/**
 * An error that is thrown when the Phoenix SDS encounters an error.
 * @since 0.4.0
 */
export class PhoenixSDSError extends Error {
  constructor(public readonly message: string) {
    super(message)
    this.name = 'PhoenixSDSError'
  }
}
