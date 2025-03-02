/**
 * An async lock which allows the subsequent execution of updates.
 */
export class AsyncLock {
  private isLocked = false
  private callbackQueue: Array<() => Promise<void>> = []

  /**
   * Acquires the lock and executes the callback.
   *
   * If the lock is already acquired, the callback will be queued.
   * @param callback The callback
   */
  public async acquire(callback: () => Promise<void>): Promise<void> {
    if (this.isLocked) {
      await new Promise<void>(resolve => {
        this.callbackQueue.push(async () => {
          await callback()
          resolve()
        })
      })
    } else {
      this.isLocked = true
      await callback()
      this.release()
    }
  }

  /**
   * Releases the lock and executes the next callback in the queue.
   * @private
   */
  private release(): void {
    if (this.callbackQueue.length > 0) {
      const nextCallback = this.callbackQueue.shift()! // Will logically always have at least one item
      nextCallback().then(() => this.release())
    } else {
      this.isLocked = false
    }
  }
}
