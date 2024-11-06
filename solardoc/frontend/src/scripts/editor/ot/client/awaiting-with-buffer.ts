/**
 * @file awaiting-with-buffer.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the AwaitingWithBuffer class and is based on the original implementation in
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
import type { TextTransformation } from '@/scripts/editor/ot/text-operation'
import type {OTBaseClient} from "@/scripts/editor/ot/client/ot-client";
import {AwaitingConfirm} from "@/scripts/editor/ot/client/awaiting-confirm";
import {OTState} from "@/scripts/editor/ot/client/ot-state";
import type {Selection} from "@/scripts/editor/ot/client/selection";

export class AwaitingWithBuffer extends OTState {
  private readonly _outstanding: TextTransformation
  private readonly _buffer: TextTransformation

  constructor(outstanding: TextTransformation, buffer: TextTransformation) {
    this._outstanding = outstanding
    this._buffer = buffer
  }

  /**
   * The outstanding operation that has not been acknowledged by the server.
   * @since 1.0.0
   */
  get outstanding(): TextTransformation {
    return this._outstanding
  }

  /**
   * The buffer of operations that have not been acknowledged by the server.
   * @since 1.0.0
   */
  get buffer(): TextTransformation {
    return this._buffer
  }

  /**
   * Compose the users changes onto the buffer.
   * @param client The client to apply the operation to.
   * @param operation The operation to apply.
   */
  async applyClient(client: OTBaseClient, operation: TextTransformation): Promise<AwaitingWithBuffer> {
    return new AwaitingWithBuffer(this._outstanding, this._buffer.compose(operation))
  }

  /**
   * Apply the server operation to the client.
   *
   * Operation comes from another client
   *
   *                        /\
   *      this.outstanding /  \ operation
   *                      /    \
   *                     /\    /
   *        this.buffer /  \* / pair1[0] (new outstanding)
   *                   /    \/
   *                   \    /
   *           pair2[1] \  / pair2[0] (new buffer)
   *  the transformed    \/
   *  operation -- can be applied to the client's current document
   * @param client The client to apply the operation to.
   * @param operation The operation to apply.
   */
  async applyServer(client: OTBaseClient, operation: TextTransformation): Promise<AwaitingWithBuffer> {
    const pair1 = TextTransformation.transform(this.outstanding, operation) // -> [newOutstanding, transformedOperation]
    const pair2 = TextTransformation.transform(this.buffer, pair1[1]) // -> [newBuffer, transformedOperation]
    await client.applyServer(pair2[1]) // Apply the transformed received operation to the client's document
    return new AwaitingWithBuffer(pair1[0], pair2[0])
  }

  /**
   * The pending operation has been acknowledged by the server.
   *
   * The buffer is now the outstanding operation and the buffer is empty. The client will now wait for the buffer to
   * acknowledge by the server.
   * @param client The client to apply the operation to.
   */
  async serverAck(client: OTBaseClient): Promise<void> {
    await client.sendOperation(client.revision, this.buffer)
    return new AwaitingConfirm(this.buffer)
  }

  async transformSelection(selection: Selection): Promise<Selection> {
    return selection.transform(this._outstanding).transform(this._buffer)
  }

  /**
   * Resend the outstanding operation to the server.
   * @param client The client to resend the operation to.
   */
  async resend(client: OTBaseClient): Promise<void> {
    await client.sendOperation(client.revision, this._outstanding)
  }
}
