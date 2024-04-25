import {SolardocError} from "@/errors/solardoc-error";
import type {ErrorsResp} from "@/services/phoenix/gen/phoenix-rest-service";
import {titlecase} from "@/scripts/titlecase";

export type ActualPhxErrorResp = {
  errors: { detail: string } | { [key: string]: Array<string> }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an error.
 * @since 0.4.0
 */
export class PhoenixRestError extends SolardocError {
  constructor(
    public readonly message: string,
    public readonly errorCode?: number,
    public readonly errorDescription?: string,
    public readonly name: string = 'PhoenixRestError',
    options?: {
      hideErrorCode: boolean,
    },
  ) {
    super(
      name,
      message,
      'Error',
      `${message}${options?.hideErrorCode ? '' : ` (Code: ${errorCode ?? 'Unknown'})`}`,
      errorDescription ?? 'No description provided. Check the console for more information.'
    )
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters a bad request error, usually due to invalid
 * input.
 * @since 0.6.0
 */
export class PhoenixBadRequestError extends PhoenixRestError {
  constructor(
    public readonly message: string,
    errorDescription?: string | ActualPhxErrorResp,
    options?: {
      hideErrorCode: boolean,
    },
  ) {
    super(
      message,
      400,
      errorDescription ?
        PhoenixBadRequestError.parseErrorDescription(errorDescription)
        : 'Invalid request data. Please check your input and try again.',
      'PhoenixBadRequestError',
      options,
    )
  }

  private static parseErrorDescription(errorDescription: string | ActualPhxErrorResp): string {
    if (typeof errorDescription === 'string') {
      return errorDescription
    } else if ("detail" in errorDescription.errors) {
      return (errorDescription.errors as { detail: string }).detail
    } else {
      return Object.entries(errorDescription.errors).map(([key, value]) => {
        return `${titlecase(key)}: ${titlecase(value.join(', '))}`
      }).join('\n')
    }
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an unauthorized error, usually due to invalid
 * authentication.
 */
export class PhoenixNotAuthorisedError extends PhoenixRestError {
  constructor(
    public readonly message: string,
    public readonly errorDescription: string = 'You are not authorised to perform this action. Please log in.',
    options?: {
      hideErrorCode: boolean,
    },
  ) {
    super(
      message,
      401,
      errorDescription,
      'PhoenixNotAuthorisedError',
      options,
    )
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an invalid credentials error, usually due to
 * incorrect authentication.
 * @since 0.6.0
 */
export class PhoenixInvalidCredentialsError extends PhoenixRestError {
constructor(
    public readonly message: string = 'Invalid credentials',
    public readonly errorDescription: string = 'Invalid credentials. Please check your email and password.',
  ) {
    super(
      message,
      401,
      errorDescription,
      'PhoenixInvalidCredentialsError',
      {hideErrorCode: true}
    )
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters a forbidden error, usually due to insufficient
 * permissions.
 * @since 0.6.0
 */
export class PhoenixForbiddenError extends PhoenixRestError {
  constructor(
    public readonly message: string,
    public readonly errorDescription: string = 'You are not authorised to perform this action. Insufficient permissions.',
    options?: {
      hideErrorCode: boolean,
    },
  ) {
    super(
      message,
      403,
      errorDescription,
      'PhoenixForbiddenError',
      options,
    )
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an unexpected error.
 * @since 0.4.0
 */
export class PhoenixInternalError extends SolardocError {
  constructor(
    public readonly message: string,
    public readonly errorDescription?: string,
    public readonly name: string = 'PhoenixInternalError',
  ) {
    super(
      name,
      message,
      'Internal Error',
      message,
      errorDescription ?? 'An error occurred in the Phoenix backend service. Check the console for more information.',
    )
  }
}

/**
 * An error that is thrown when the Phoenix backend service encounters an invalid operation.
 * @since 0.4.0
 */
export class PhoenixInvalidOperationError extends PhoenixInternalError {
  constructor(public readonly message: string) {
    super(
      message,
      'An invalid operation was attempted on the Phoenix backend service. Check the console for more information.',
      'PhoenixInvalidOperationError',
    )
  }
}

/**
 * An error that is thrown when the Phoenix SDS encounters an error.
 * @since 0.4.0
 */
export class PhoenixSDSError extends SolardocError {
  constructor(
    public readonly message: string,
    public readonly errorDescription?: string,
  ) {
    super(
      'PhoenixSDSError',
      message,
      'SDS Error',
      message,
      errorDescription ?? 'An error occurred in the Phoenix SDS. Check the console for more information.'
    )
  }
}
