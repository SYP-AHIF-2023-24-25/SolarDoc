/**
 * @file self-meta.ts
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
import type {TextOperation} from "@/scripts/editor/ot/text-operation";
import type {Selection} from "@/scripts/editor/ot/core/selection";

/**
 * Represents the metadata of a client operation.
 * @since 1.0.0
 */
export class SelfMeta {
  private readonly _selectionBefore: Selection
  private readonly _selectionAfter: Selection

  constructor(selectionBefore: Selection, selectionAfter: Selection) {
    this._selectionBefore = selectionBefore
    this._selectionAfter = selectionAfter
  }

  get selectionBefore(): Selection {
    return this._selectionBefore
  }

  get selectionAfter(): Selection {
    return this._selectionAfter
  }

  invert(): SelfMeta {
    return new SelfMeta(this._selectionAfter, this._selectionBefore)
  }

  compose(other: SelfMeta): SelfMeta {
    return new SelfMeta(this._selectionBefore, other._selectionAfter)
  }

  transform(operation: TextOperation): SelfMeta {
    return new SelfMeta(this._selectionBefore.transform(operation), this._selectionAfter.transform(operation))
  }
}
