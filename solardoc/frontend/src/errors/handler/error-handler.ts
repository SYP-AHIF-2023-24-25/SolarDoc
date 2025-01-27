import { SolardocError } from '@/errors/solardoc-error'
import { showNotifFromErr } from '@/scripts/show-notif'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

/**
 * An error handler which displays a notification to the user in case the error is a {@link SolardocError}, otherwise
 * it will simply re-throw the error.
 * @param e The error to handle.
 * @throws unknown The error, if it is not a {@link SolardocError}.
 * @since 0.6.0
 */
export function handleError(e: unknown): void {
  if (e instanceof SolardocError) {
    showNotifFromErr(e)
  }
  throw e
}

/**
 * An error handler wrapper which runs await a promise and catches any error and displays it to the user.
 *
 * This is a function simplifying error handling by acting as a sort of "middleware", which catches any error thrown
 * by the promise and handles it. If the error is a SolardocError, it will be displayed as a notification.
 *
 * To allow for easier debugging and error handling, we'll still let the error bubble up to the caller, so that they
 * can handle it as needed. This is simply to make sure we also get the error displayed to the user.
 * @param func The promise to run. This must be an awaitable function, which has been populated with the necessary
 * arguments and is ready to be executed.
 * @param options The options for the error handler.
 * @param options.onError An optional callback to run in case an error is caught. This can be used to run additional error
 * handling code, or to log the error to a logging service.
 * @param options.onFinally An optional callback to run after the promise has been resolved or rejected. This can be used to
 * run cleanup code, or to update the UI after the promise has been resolved.
 * @returns The result of the promise, if it was successful. If the promise failed, the error will be caught and
 * displayed as a notification, and the function will return that error in case it is needed.
 * @since 0.6.0
 * @see SolardocError
 * @see NotifiableError
 */
export async function interceptErrors<FuncT extends Promise<any>>(
  func: FuncT,
  options: {
    onError?: (e: unknown) => void
    onFinally?: () => void
  } = {},
): Promise<Awaited<FuncT>> {
  try {
    const result = await func
    if (options.onFinally) {
      options.onFinally()
    }
    return result
  } catch (e) {
    loadingStore.setLoading(false)
    handleError(e)

    if (options.onError) {
      options.onError(e)
    }
    if (options.onFinally) {
      options.onFinally()
    }

    throw e
  }
}
