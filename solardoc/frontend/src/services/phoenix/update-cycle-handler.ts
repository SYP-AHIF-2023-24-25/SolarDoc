import { useCurrentFileStore } from '@/stores/current-file'
import type { OTransReqDto, OTransRespDto } from '@/services/phoenix/ot-trans'

/**
 * The update cycle handler is a simple process that manages the incoming and outcoming OT updates.
 *
 * It will simply act as a loop which will thread-safe update the document with the incoming updates and send the
 * outgoing updates to the server.
 */
export class UpdateCycleHandler {
  private readonly _updateInterval: number = 100
  private _running: boolean = false
  private _processing: boolean = false
  private readonly currentFileStore = useCurrentFileStore()
  private readonly _handleIn: (received: OTransRespDto) => Promise<void>
  private readonly _handleOut: (sent: OTransReqDto) => Promise<void>

  public constructor(
    handleIn: (received: OTransRespDto) => Promise<void>,
    handleOut: (sent: OTransReqDto) => Promise<void>,
  ) {
    this._handleIn = handleIn
    this._handleOut = handleOut
  }

  public get running(): boolean {
    return this._running
  }

  private async _processUpdates() {
    if (!this._running) {
      return
    }

    if (!this._processing) {
      this._processing = true

      const oTransOut = this.currentFileStore.oTransNotAcked.shift()
      if (oTransOut) {
        await this._handleOut(oTransOut)
      } else {
        const oTransIn = this.currentFileStore.oTransNotPerf.shift()
        if (oTransIn) {
          await this._handleIn(oTransIn)
        }
      }

      this._processing = false
    }

    setTimeout(() => this._processUpdates(), this._updateInterval)
  }

  public start() {
    if (this._running) {
      return
    }
    this._running = true
    setTimeout(() => this._processUpdates(), this._updateInterval)
  }

  public stop() {
    this._running = false
  }
}
