/**
 * @file ot-state.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the OTState class and is based on the original implementation in
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
import type { OTBaseClient } from '@/scripts/editor/ot/client/ot-client'
import type {TextTransformation} from "@/scripts/editor/ot/text-operation";

/**
 * The possible states of the OT client.
 * @since 1.0.0
 */
export abstract class OTState {
  /**
   * Applies the client operation to the state.
   * @param client The client to apply the operation to.
   * @param operation The operation to apply.
   */
  abstract applyClient(client: OTBaseClient, operation: TextTransformation): Promise<OTState>

  /**
   * Applies the server operation to the state.
   * @param client The client to apply the operation to.
   * @param operation The operation to apply.
   */
  abstract applyServer(client: OTBaseClient, operation: TextTransformation): Promise<OTState>

  /**
   * Acknowledges the server operation.
   * @param client
   */
  abstract serverAck(client: OTBaseClient): Promise<OTState>

  /**
   * Transforms the latest known server selection by the given operation.
   * @param selection
   */
  abstract transformSelection(selection: Selection): Promise<Selection>

  /**
   * Resend the operation to the server in case it was lost.
   * @param client The client to resend the operation to.
   */
  abstract resend(client: OTBaseClient): Promise<void>
}
