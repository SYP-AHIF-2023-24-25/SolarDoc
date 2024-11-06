/**
 * @file ot-client.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the OTBaseClient class and is based on the original implementation in
 * ot.js from Tim Baumann and as such will be licensed under the MIT license.
 *
 * License:
 *
 * Copyright © 2012-2014 Tim Baumann, http://timbaumann.info
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import type { Synchronised } from '@/scripts/editor/ot/core/synchronised'
import type { TextOperation } from '@/scripts/editor/ot/text-operation'
import type {AwaitingConfirm} from "@/scripts/editor/ot/core/awaiting-confirm";
import type {AwaitingWithBuffer} from "@/scripts/editor/ot/core/awaiting-with-buffer";

/**
 * The possible states of the OT client.
 * @since 1.0.0
 */
export type State = Synchronised | AwaitingConfirm | AwaitingWithBuffer

/**
 * The OT client that manages the state of the document.
 */
export abstract class OTBaseClient {
  private _revision: number
  private _state: State

  protected constructor(revision: number) {
    this._revision = revision
    this._state = Synchronised.instance
  }

  /**
   * Sets the state of the document.
   * @param state The state to set.
   */
  setState(state: State): void {
    this._state = state
  }

  /**
   * The current state of the document.
   * @since 1.0.0
   */
  getState(): State {
    return this._state
  }

  /**
   * The current revision number of the document.
   * @since 1.0.0
   */
  get revision() {
    return this._revision
  }

  /**
   * Applies the user input to the client.
   * @param operation The operation to apply.
   */
  async applyClient(operation: TextOperation): Promise<void>  {
    this.setState(await this.getState().applyClient(operation))
  }

  /**
   * Applies the server operation to the client.
   * @param operation The operation to apply.
   */
  async applyServer(operation: TextOperation): Promise<void>  {
    this._revision += 1
    this.setState(await this.getState().applyServer(operation))
  }

  /**
   * Acknowledges the server operation.
   */
  async serverAck(): Promise<void>  {
    this._revision += 1
    this.setState(await this.getState().serverAck())
  }

  /**
   * Transforms a selection from the latest known server state to the current client state. For example, if we get from
   * the server the information that another user's cursor is at position 3, but the server hasn't yet received our
   * newest operation, an insertion of 5 characters at the beginning of the document, the correct position of the other
   * user's cursor in our current document is 8.
   * @param selection The selection to transform.
   */
  async transformSelection(selection): Promise<void> {
    await this.getState().transformSelection(selection)
  }

  /**
   * Sends the operation to the server.
   * @param revision The revision number of the operation.
   * @param operation The operation to send.
   * @since 1.0.0
   * @abstract
   */
  abstract sendOperation(revision: number, operation: TextOperation): Promise<void>

  /**
   * Applies a server operation to the client.
   * @param operation The operation to apply.
   * @since 1.0.0
   * @abstract
   */
  abstract applyOperation(operation: TextOperation): Promise<void>
}
