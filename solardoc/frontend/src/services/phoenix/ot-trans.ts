import { useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { v4 as uuidv4 } from 'uuid'
import { AsyncLock } from '@/common'

const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

/**
 * A raw operational transformation which inserts text.
 */
export interface RawInsertOTrans {
  readonly type: 'insert'
  readonly pos: number
  readonly content: string
}

/**
 * A raw operational transformation which deletes text.
 */
export interface RawDeleteOTrans {
  readonly type: 'delete'
  readonly pos: number
  readonly length: number
}

/**
 * A raw operational transformation.
 */
export type RawOTrans = RawInsertOTrans | RawDeleteOTrans

/**
 * A DTO for an operational transformation transaction request.
 *
 * This will be sent to the server and then returned as a full transaction in form of {@link OTransRespDTO}.
 */
export interface OTransReqDto {
  id: string
  trans: RawOTrans
}

/**
 * A DTO for an operational transformation transaction response.
 *
 * This will be sent to the client and then stored in the local database.
 */
export interface OTransRespDto {
  id: string
  trans: RawOTrans
  timestamp: number
  user_id: string
}

/**
 * An operational transformation transaction.
 * @since 0.5.0
 */
export interface OTrans {
  id: string
  trans: RawOTrans
  timestamp: number | undefined
  user_id: string
  acknowledged: boolean
  init: boolean
}

/**
 * A wrapper class combining all the previously loosely defined functions and spread-out logic.
 * @since 1.0.0-beta.6
 */
export class OTManager {
  /**
   * A lock to prevent multiple outgoing OTs from being sent at the same time.
   * @private
   * @deprecated
   */
  private static readonly legacyOutgoingLock = new AsyncLock()

  /**
   * A lock to prevent multiple outgoing OTs from being sent at the same time and ensures the order of the OTs is
   * preserved.
   * @private
   */
  private static readonly outgoingLock = new AsyncLock()

  /**
   * A lock ensuring no edits are made to the OT queue while it is being processed.
   *
   * This is important as incoming messages and outgoing messages can be processed at the same time, which could lead to
   * a race condition, where data is lost.
   * @private
   */
  private static readonly outgoingQueueLock = new AsyncLock()

  /**
   * A lock ensuring no edits are made to the OT queue while it is being processed.
   *
   * This is important as incoming messages and outgoing messages can be processed at the same time, which could lead to
   * a race condition, where data is lost.
   * @private
   */
  private static readonly ackQueueLock = new AsyncLock()

  /**
   * A stack of waiting OTs that are waiting to be sent to the server.
   *
   * Everytime an acknowledgement is received from the server, the oldest OT (first in the array) will be removed and
   * sent to the server.
   * @private
   */
  private static outgoingOTQueue: Array<OTransReqDto> = []

  /**
   * A queue for all the OTs that are waiting for an acknowledgement from the server.
   *
   * This is always going to be at most one OT, as we will only send the next OT once the previous one has been
   * acknowledged. This may change in the future, if full OT merging and eventual consistency is implemented, where
   * sending multiple OTs at once is possible.
   * @private
   */
  private static ackQueue: Array<OTransReqDto> = []

  /**
   * Returns whether the OT queue is empty.
   */
  public static get oTransQueueEmpty(): boolean {
    return Object.keys(this.outgoingOTQueue).length === 0
  }

  /**
   * Returns whether the acknowledgement queue is empty.
   */
  public static get ackQueueEmpty(): boolean {
    return Object.keys(this.ackQueue).length === 0
  }

  /**
   * Gets the next OT to send and moves it to the waiting queue.
   * @private
   */
  private static async threadSafeGetNextOTransToSend(): Promise<OTransReqDto | undefined> {
    const nextOTrans = <OTransReqDto | undefined>this.outgoingOTQueue[0]
    if (nextOTrans === undefined) return nextOTrans
    await this.threadSafeRemoveOTransFromQueue(nextOTrans.id)
    await this.threadSafePushOTransToAckQueue(nextOTrans)
    return nextOTrans
  }

  /**
   * Pushes an OT to the queue.
   * @param oTrans The OT to push to the queue.
   * @private
   */
  private static async threadSafePushOTransToQueue(oTrans: OTransReqDto): Promise<void> {
    return this.outgoingQueueLock.acquire(async () => {
      this.outgoingOTQueue.push(oTrans)
    })
  }

  /**
   * Pushes multiple OTs to the queue.
   * @param oTrans The OTs to push to the queue.
   * @private
   */
  private static async threadSafePushOTsToQueue(oTrans: Array<OTransReqDto>): Promise<void> {
    const promises = oTrans.map(oTrans => this.threadSafePushOTransToQueue(oTrans))
    await Promise.all(promises)

    // Merge the OTs which can be merged
    await this.threadSafeOptimiseQueue()
  }

  /**
   * Removes an OT from the queue.
   * @param id The ID of the OT to remove.
   * @private
   */
  private static async threadSafeRemoveOTransFromQueue(id: string): Promise<void> {
    return this.outgoingQueueLock.acquire(async () => {
      this.outgoingOTQueue = this.outgoingOTQueue.filter(oTrans => oTrans.id !== id)
    })
  }

  /**
   * Pushes an OT to the acknowledgement queue.
   * @param oTrans The OT to push to the queue.
   * @private
   */
  private static async threadSafePushOTransToAckQueue(oTrans: OTransReqDto): Promise<void> {
    return this.ackQueueLock.acquire(async () => {
      this.ackQueue.push(oTrans)
    })
  }

  /**
   * Removes an OT from the acknowledgement queue.
   * @param id The ID of the OT to remove.
   * @private
   */
  private static async threadSafeRemoveOTransFromAckQueue(id: string): Promise<void> {
    return this.ackQueueLock.acquire(async () => {
      this.ackQueue = this.ackQueue.filter(oTrans => oTrans.id !== id)
    })
  }

  /**
   * Returns whether an OT is in the acknowledgement queue.
   * @param id The ID of the OT to check for.
   * @private
   */
  private static oTransInAckQueue(id: string): boolean {
    return this.ackQueue.some(oTrans => oTrans.id === id)
  }

  /**
   * Merges the OTs in the queue if possible.
   * @private
   */
  private static async threadSafeOptimiseQueue(): Promise<void> {
    return this.outgoingQueueLock.acquire(async () => {
      this.outgoingOTQueue = this.mergeOTransIfPossible(this.outgoingOTQueue)
    })
  }

  /**
   * Creates an OTrans object which represents a change to the content.
   * @param insertOrDeleteTrans The raw insert or delete OTrans.
   * @returns The OTrans object.
   */
  public static createOTrans(insertOrDeleteTrans: RawInsertOTrans | RawDeleteOTrans): OTransReqDto {
    return {
      id: uuidv4(),
      trans: insertOrDeleteTrans,
    }
  }

  /**
   * Creates an OTrans object which represents a deletion of text.
   * @param pos The position at which the text should be deleted.
   * @param length The length of the text to delete.
   */
  public static createDeleteOTrans(pos: number, length: number): OTransReqDto {
    return this.createOTrans({ type: 'delete', pos, length })
  }

  /**
   * Creates an OTrans object which represents an insertion of text.
   * @param pos The position at which the text should be inserted.
   * @param content The content to insert.
   */
  public static createInsertOTrans(pos: number, content: string): OTransReqDto {
    return this.createOTrans({ type: 'insert', pos, content })
  }

  /**
   * Merges the operational transformation requests if possible.
   *
   * We can only merge OTs that are next to each other and are handling the same area of text. So multiple consecutive
   * insertions or deletions can be merged into one. Also, an insertion followed by a deletion can be merged into a
   * shortened insertion (if the deletion is shorter than the insertion) or a shortened deletion (if the insertion is
   * shorter than the deletion).
   * @param ots The operational transformation requests to merge.
   */
  public static mergeOTransIfPossible(ots: Array<OTransReqDto>): Array<OTransReqDto> {
    if (ots.length === 0) return []

    const mergedOTrans: Array<OTransReqDto> = []
    let currentOTrans = ots[0]

    for (let i = 1; i < ots.length; i++) {
      const nextOTrans = ots[i]

      if (
        currentOTrans.trans.type === 'insert' &&
        nextOTrans.trans.type === 'insert' &&
        currentOTrans.trans.pos + currentOTrans.trans.content.length === nextOTrans.trans.pos
      ) {
        // Merge consecutive insertions
        currentOTrans = {
          ...currentOTrans,
          trans: {
            ...currentOTrans.trans,
            content: currentOTrans.trans.content + nextOTrans.trans.content,
          },
        }
      } else if (
        currentOTrans.trans.type === 'delete' &&
        nextOTrans.trans.type === 'delete' &&
        currentOTrans.trans.pos - currentOTrans.trans.length === nextOTrans.trans.pos
      ) {
        // Merge consecutive deletions
        currentOTrans = {
          ...currentOTrans,
          trans: {
            ...currentOTrans.trans,
            length: currentOTrans.trans.length + nextOTrans.trans.length,
          },
        }
      } else if (
        currentOTrans.trans.type === 'insert' &&
        nextOTrans.trans.type === 'delete' &&
        currentOTrans.trans.pos + currentOTrans.trans.content.length === nextOTrans.trans.pos
      ) {
        // Merge insertion followed by deletion
        const insertLength = currentOTrans.trans.content.length
        const deleteLength = nextOTrans.trans.length

        if (deleteLength < insertLength) {
          currentOTrans = {
            ...currentOTrans,
            trans: {
              ...currentOTrans.trans,
              content: currentOTrans.trans.content.slice(0, -deleteLength),
            },
          }
        } else {
          currentOTrans = {
            ...currentOTrans,
            trans: {
              type: 'delete',
              pos: currentOTrans.trans.pos,
              length: deleteLength - insertLength,
            },
          }
        }
      } else {
        mergedOTrans.push(currentOTrans)
        currentOTrans = nextOTrans
      }
    }

    mergedOTrans.push(currentOTrans)
    return mergedOTrans
  }

  /**
   * Starts the process which will handle the incoming and outgoing OT updates. If the listener was already set up, this
   * public static will do nothing.
   *
   * If the websocket client is not connected, this function will return undefined.
   */
  public static listenForUpdates(): Promise<void> | undefined {
    return editorUpdateWSClient.wsClient?.listenForOTrans(
      async msg => await OTManager.handleIncomingUpdate(msg),
    )
  }

  /**
   * Handles an incoming operational transformation update.
   * @param toProcess The operational transformation update to process.
   */
  public static async handleIncomingUpdate(toProcess: OTransRespDto): Promise<void> {
    console.log(`[OT] Received OT update by '${toProcess.id}':`, toProcess)
    await currentFileStore.pushOTransResp(toProcess)

    // Remove the OT from the waiting queue
    if (this.oTransInAckQueue(toProcess.id)) {
      console.log(`[OT] Acknowledging OT '${toProcess.id}' if in stack:`, toProcess)
      await this.threadSafeRemoveOTransFromAckQueue(toProcess.id)

      // If there are waiting OTs, send the next on
      await this.threadSafePullNextAndSend()
    }
  }

  /**
   * Sends the operational transformation updates to the server. This is a thread-safe method which will handle the
   * updates in a way that prevents a race condition between the updates and ensures the order of the updates is
   * preserved.
   *
   * This does not ensure that the server is not overwhelmed, as it only applies a critical section to a minimal
   * amount of code and effectively runs through the updates very quickly. That is prevented by {@link sendOTUpdates},
   * the default method to send OT updates, which is used by this method, unless {@param newAlgorithm} is set to false.
   * @param ots The operational transformation updates to send.
   * @param hasChannelConnection Whether the user has a channel connection. This determines whether we should send the
   * updates to the server.
   * @param newAlgorithm Whether to use the new algorithm to send the updates. If set to false, the legacy algorithm
   * will be used.
   */
  public static threadSafeSendOTUpdates(
    ots: Array<Array<OTransReqDto>>,
    hasChannelConnection: boolean = false,
    newAlgorithm: boolean = true,
  ): Promise<void> {
    if (newAlgorithm) {
      return this.outgoingLock.acquire(async () => {
        await this.sendOTUpdates(ots, hasChannelConnection)
      })
    } else {
      return this.legacySendOTUpdates(ots, hasChannelConnection)
    }
  }

  /**
   * Sends the operational transformation updates to the server.
   * @param ots The operational transformation updates to send.
   * @param hasChannelConnection Whether the user has a channel connection. This determines whether we should send the
   * updates to the server.
   * @deprecated Since 1.0.0-beta.6, use {@link sendOTUpdates} instead.
   */
  private static async legacySendOTUpdates(
    ots: Array<Array<OTransReqDto>>,
    hasChannelConnection: boolean = false,
  ): Promise<void> {
    const promises = ots.flat().map(oTrans =>
      this.legacyOutgoingLock.acquire(async () => {
        console.debug(`[Legacy OT] Pushing OT operation:`, oTrans)
        await this.handleOutgoingUpdate(oTrans, hasChannelConnection)
      }),
    )
    await Promise.all(promises)
  }

  /**
   * Sends the operational transformation updates to the server.
   *
   * This uses a new algorithm to send the updates to the server. It will merge all incoming transformations into a single
   * transformation and send it to the server. This is to prevent the server from receiving too many requests at once.
   *
   * Furthermore, it will wait for the last transformation to be acknowledged by the server before sending the next one.
   * @param ots The operational transformation updates to send.
   * @param hasChannelConnection Whether the user has a channel connection. This determines whether we should send the
   * updates to the server.
   * @private
   */
  private static async sendOTUpdates(
    ots: Array<Array<OTransReqDto>>,
    hasChannelConnection: boolean = false,
  ): Promise<void> {
    const mergedOts = this.mergeOTransIfPossible(ots.flat())
    if (!hasChannelConnection) {
      // If we have no connection we can simply push the OTs to the local store as needed
      const promises = mergedOts.flat().map(oTrans =>
        this.legacyOutgoingLock.acquire(async () => {
          console.debug(`[Offline OT] Pushing OT operation:`, oTrans)
          await this.handleOutgoingUpdate(oTrans, false)
        }),
      )
      await Promise.all(promises)
      return
    }

    // We will queue the OTs and send them one by one, if the queue is empty we will send the first one and then wait
    // to send any remaining ones
    const noOTBeingProcessed = this.oTransQueueEmpty && this.ackQueueEmpty
    await this.threadSafePushOTsToQueue(mergedOts)
    if (noOTBeingProcessed) {
      await this.threadSafePullNextAndSend()
    }
  }

  /**
   * Sends the next OT in the queue to the server.
   *
   * This does nothing if {@link oTransQueueEmpty} is true.
   * @private
   */
  private static async threadSafePullNextAndSend(): Promise<void> {
    const toSend = await this.threadSafeGetNextOTransToSend()
    if (toSend) {
      // Avoid blocking the thread by not waiting for the send process to finish (as it will be handled by the
      // incoming OT handler anyway, there is no need to wait for it to finish)
      console.log(`[OT] Sending next item ${toSend!.id}:`, toSend)
      void this.handleOutgoingUpdate(toSend, true)
    }
  }

  /**
   * Handles a single outgoing operational transformation update, which has been handled tread-safe and is ready to be
   * processed and sent to the server.
   * @param toSend The operational transformation update to send.
   * @param sendToRemote Whether to send the update to the remote server.
   * @private
   */
  private static async handleOutgoingUpdate(
    toSend: OTransReqDto,
    sendToRemote: boolean = false,
  ): Promise<void> {
    await currentFileStore.pushOTransReq(toSend)
    if (sendToRemote) {
      await editorUpdateWSClient.wsClient?.sendOTrans(toSend, (resp: any) => {
        console.error(`[OT] Received error response in response to OT request: ${resp}`)
      })
    }
  }
}
