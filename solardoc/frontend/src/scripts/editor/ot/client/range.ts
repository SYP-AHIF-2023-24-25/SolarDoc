/**
 * @file range.ts
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the Range class and is based on the original implementation in
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

function transformIndex(index: number, operation: TextTransformation): number {
  let newIndex = index
  for (const op of operation.ops) {
    if (op.isRetain) {
      index -= op.length
    } else if (op.isInsert) {
      newIndex += op.text.length
    } else {
      // Delete
      newIndex -= Math.min(index, op.length)
      index -= op.length
    }

    if (index < 0) {
      return newIndex
    }
  }
  return newIndex
}

/**
 * Represents a range or cursor in the document.
 * @since 1.0.0
 */
export class Range {
  /**
   * Create a new range.
   * @param anchor The anchor of the range. The position that doesn't move when the range is extended.
   * @param head The head of the range. The position that moves when the range is extended. May be equal to the anchor
   * to indicate a cursor.
   */
  constructor(
    public anchor: number,
    public head: number,
  ) {}

  equals(other: Range): boolean {
    return this.anchor === other.anchor && this.head === other.head
  }

  isEmpty(): boolean {
    return this.anchor === this.head
  }

  transform(operation: TextTransformation): Range {
    const newAnchor = transformIndex(this.anchor, operation)
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor)
    }
    return new Range(newAnchor, transformIndex(this.head, operation))
  }
}
