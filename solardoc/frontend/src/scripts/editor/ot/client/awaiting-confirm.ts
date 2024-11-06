/**
 * @file awaiting-confirm.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the AwaitingConfirm class and is based on the original implementation in
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
import  { type OTBaseClient } from '@/scripts/editor/ot/client/ot-client'
import type { TextTransformation } from '@/scripts/editor/ot/text-operation'
import  { type OTState } from '@/scripts/editor/ot/client/ot-state'
import {AwaitingWithBuffer} from "@/scripts/editor/ot/client/awaiting-with-buffer";
import {Synchronised} from "@/scripts/editor/ot/client/synchronised";
import type {Selection} from "@/scripts/editor/ot/client/selection";

/**
 * Represents the state of the client when it is waiting for the server to acknowledge an operation.
 * @since 1.0.0
 */
export class AwaitingConfirm extends OTState {
  private readonly _outstanding: TextTransformation

  constructor(outstanding: TextTransformation) {
    this._outstanding = outstanding
  }

  /**
   * The outstanding operation that has not been acknowledged by the server.
   * @since 1.0.0
   */
  get outstanding(): TextTransformation {
    return this._outstanding
  }

  /**
   * Applies the client operation to the state. We don't send it to the server immediately but buffer it.
   * @param client The client to apply the operation to.
   * @param operation The operation to apply.
   */
  async applyClient(client: OTBaseClient, operation: TextTransformation): Promise<OTState> {
    return new AwaitingWithBuffer(this._outstanding, operation)
  }

  /**
   * This is another client's operation. Visualization:
   *
   *                    /\
   *  this.outstanding /  \ operation
   *                  /    \
   *                  \    /
   *   pair[1]         \  / pair[0] (new outstanding)
   *   (can be applied  \/
   *   to the client's
   *   current document)
   * @param client The client to apply the operation to.
   * @param operation The operation from the server to apply.
   */
  async applyServer(client: OTBaseClient, operation: TextTransformation): Promise<OTState> {
    const pair = TextTransformation.transform(this._outstanding, operation)
    await client.applyOperation(pair[1])
    return new AwaitingConfirm(pair[0])
  }

  async serverAck(): Promise<OTState> {
    return Synchronised.instance
  }

  async transformSelection(selection: Selection): Promise<Selection> {
    return selection.transform(this._outstanding)
  }

  /**
   * Resends the outstanding operation to the server.
   * @param client The client to resend the operation to.
   */
  async resend(client: OTBaseClient): Promise<void> {
    await client.sendOperation(client.revision, this._outstanding)
  }
}
