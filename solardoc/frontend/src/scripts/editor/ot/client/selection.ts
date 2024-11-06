/**
 * @file selection.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the Selection class and is based on the original implementation in
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
import { Range } from '@/scripts/editor/ot/client/range'

function sortRanges(ranges: Array<Range>): Array<Range> {
  return ranges.slice().sort((a, b) => a.anchor - b.anchor || a.head - b.head)
}

/**
 * A selection is a collection of ranges. Every range represents a cursor or a selection range in the document.
 */
export class Selection {
  private readonly _ranges: Array<Range>

  constructor(ranges: Array<Range> = []) {
    this._ranges = ranges
  }

  get ranges(): Array<Range> {
    return this._ranges
  }

  /**
   * Checks whether this selection is identical to another selection.
   * @param other The other selection to compare to.
   */
  equals(other: Selection): boolean {
    if (this._ranges.length !== other._ranges.length) {
      return false
    }
    const sortedRanges = sortRanges(this._ranges)
    const sortedOtherRanges = sortRanges(other._ranges)
    for (let i = 0; i < this._ranges.length; i++) {
      if (!sortedRanges[i].equals(sortedOtherRanges[i])) {
        return false
      }
    }
    return true
  }

  /**
   * Transforms the selection by the given operation.
   * @param anchor The anchor of the operation.
   */
  createCursor(anchor: number): Selection {
    return new Selection([new Range(anchor, anchor)])
  }

  /**
   * Returns true if any of the ranges in the selection is not a cursor.
   */
  isSomethingSelected(): boolean {
    return this._ranges.some(range => !range.isEmpty())
  }

  /**
   * Transforms the selection by the given operation.
   *
   * In this case this just means returning the most recent selection i.e. {@link other}
   * @param other The operation to transform the selection by.
   */
  compose(other: Selection): Selection {
    return other
  }

  /**
   * Updates all selection according to the given operation.
   * @param operation The operation to transform the selection by.
   */
  transform(operation: TextTransformation): Selection {
    const newRanges = this._ranges.map(range => range.transform(operation))
    return new Selection(newRanges)
  }
}
