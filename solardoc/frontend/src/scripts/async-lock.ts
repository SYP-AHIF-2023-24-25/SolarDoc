/**
 * An async lock which allows the subsequent execution of updates.
 */
export class AsyncLock {
  private isLocked = false
  private callbackQueue: Array<() => Promise<void>> = []

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

  private release(): void {
    if (this.callbackQueue.length > 0) {
      const nextCallback = this.callbackQueue.shift()! // Will logically always have at least one item
      nextCallback().then(() => this.release())
    } else {
      this.isLocked = false
    }
  }
}
