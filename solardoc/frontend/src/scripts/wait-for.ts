/**
 * Waits until a specific condition is met and then executes a specific request.
 * @param cond A function that returns a boolean indicating whether the condition is met.
 * @param callback A function that represents the request to be executed.
 * @param interval The interval in milliseconds to check the condition.
 * @param timeout The timeout in milliseconds to wait for the condition to be met.
 */
export async function waitForConditionAndExecute(
  cond: () => boolean,
  callback: () => Promise<void>,
  interval: number,
  timeout?: number | undefined
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = async () => {
      if (cond()) {
        try {
          await callback();
          resolve();
        } catch (error) {
          reject(error);
        }
      } else if (timeout && Date.now() - startTime >= timeout) {
        reject(new Error('Timeout exceeded'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
}
