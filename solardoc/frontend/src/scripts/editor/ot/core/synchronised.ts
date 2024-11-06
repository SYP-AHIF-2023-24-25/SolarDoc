/**
 * @file synchronised.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the Synchronised class and is based on the original implementation in
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
import { OTState } from '@/scripts/editor/ot/core/ot-state'
import type { OTBaseClient } from '@/scripts/editor/ot/core/ot-client'
import type {TextOperation} from "@/scripts/editor/ot/text-operation";
import {AwaitingConfirm} from "@/scripts/editor/ot/core/awaiting-confirm";
import {OTLogicError} from "@/scripts/editor/ot/ot-logic-error";

/**
 * Singleton class that manages the synchronisation of the editor with the server.
 * @since 1.0.0
 */
export class Synchronised extends OTState {
  private static _instance: Synchronised
  private constructor() {}

  /**
   * Returns the singleton instance of the class.
   * @since 1.0.0
   */
  static get instance(): Synchronised {
    if (!Synchronised._instance) {
      Synchronised._instance = new Synchronised()
    }
    return Synchronised._instance
  }

  async applyClient(client: OTBaseClient, operation: TextOperation): Promise<OTState> {
    await client.sendOperation(client.revision, operation)
    return new AwaitingConfirm(operation)
  }

  async applyServer(client: OTBaseClient, operation: TextOperation): Promise<OTState> {
    await client.applyOperation(operation)
    return this
  }

  async serverAck(client: OTBaseClient): Promise<OTState> {
    throw new OTLogicError('There is no server operation to acknowledge.')
  }

  async transformSelection(selection: Selection): Promise<Selection> {
    return selection
  }

  resend(): Promise<void> {
    return Promise.resolve() // No operation to resend
  }
}
