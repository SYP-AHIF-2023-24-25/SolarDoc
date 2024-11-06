/**
 * @file This file contains the implementation of the TextTransformation class.
 * @since 1.0.0
 * @author Luna Klatzer
 *
 * This file contains the implementation of the TextTransformation class and is based on the original implementation in
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

import type {SingleOperation} from "@/scripts/editor/ot/single-operation";
import {OTLogicError} from "@/scripts/editor/ot/ot-logic-error";

/**
 * A class that represents a text transformation.
 *
 * It contains the operations that were applied to the text, the length of the original text, and the length of the
 * transformed text.
 */
class TextTransformation {
  private _ops: SingleOperation[]
  private _baseLength: number
  private _transformedLength: number

  constructor() {
    this.ops = [];
    this.baseLength = 0;
    this.transformedLength = 0;
  }

  /**
   * The operations that were applied to the text.
   */
  get ops() {
    return this._ops;
  }

  /**
   * The base length is the length of every string that this transformation can be applied to.
   */
  get baseLength() {
    return this._baseLength;
  }

  /**
   * The transformed length is the result length of applying the transformation to a string of length `baseLength`.
   */
  get transformedLength() {
    return this._transformedLength;
  }

  /**
   * Compares this transformation with another transformation.
   */
  equals(other: TextTransformation): boolean {
    if (this.baseLength !== other.baseLength) { return false; }
    if (this.targetLength !== other.targetLength) { return false; }
    if (this.ops.length !== other.ops.length) { return false; }
    for (let i = 0; i < this.ops.length; i++) {
      if (this.ops[i].type !== other.ops[i].type) { return false; }
    }
    return true;
  }

  /**
   * Retains a number of characters in the text.
   * @param length The number of characters to retain.
   * @returns This transformation object for chaining.
   */
  retain(length: number): TextTransformation {
    if (length === 0) { return this; }
    this._baseLength += length;
    this._transformedLength += length;

    // Check the last operation and see if it can be merged with the new operation
    const lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.isRetain) {
      lastOp.length += length;
    } else {
      this.ops.push(new SingleOperation('retain', undefined, length));
    }

    return this; // For chaining
  }

  /**
   * Inserts text into the transformation.
   * @param text The text to insert.
   * @returns This transformation object for chaining.
   */
  insert(text: string): TextTransformation {
    if (text.length === 0) {
      return this;
    }
    this._transformedLength += text.length;

    // Check the last operation and see if it can be merged with the new operation
    const lastOp = this.ops[this.ops.length - 1];
    const secondLastOp = this.ops[this.ops.length - 2];
    if (lastOp && lastOp.isInsert) {
      lastOp.content += text;
    } else if (lastOp.isDelete) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (secondLastOp && secondLastOp.isInsert) {
        // -> insert(A), delete(N)
        secondLastOp.content += text; // Merge with the second last operation
      } else {
        // -> insert(A), delete(N)
        this.ops[this.ops.length - 1] = new SingleOperation('insert', text); // Replace the last operation
        this.ops.push(new SingleOperation('delete', undefined, lastOp.length)); // Recreate lastOp on top of the stack
      }
    } else {
      this.ops.push(new SingleOperation('insert', text));
    }

    return this; // For chaining
  }

  /**
   * Deletes text from the transformation.
   * @param length The number of characters to delete. Must be positive.
   * @returns This transformation object for chaining.
   */
  delete(length: number): TextTransformation {
    if (length === 0) {
      return this;
    }
    this._baseLength += length; // Delete doesn't change the transformed length, but changes the minimum length of the text

    // Check the last operation and see if it can be merged with the new operation
    const lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.isDelete) {
      lastOp.length += length;
    } else {
      this.ops.push(new SingleOperation('delete', undefined, length));
    }

    return this; // For chaining
  }

  /**
   * Applies the transformation to a string.
   * @param text The text to apply the transformation to.
   */
  apply(text: string): string {
    if (text.length !== this.baseLength) {
      throw new OTLogicError(`The string is of length ${text.length}, but the transformation can only be applied to texts of length ${this.baseLength}.`);
    }

    const newStr: Array<string> = [];
    let strIndex = 0;
    for (const op of this.ops) {
      if (op.isRetain) {
        if (strIndex + op.length > text.length) {
          throw new OTLogicError('The retain operation goes beyond the end of the string.');
        }

        newStr.push(text.slice(strIndex, strIndex + op.length));
        strIndex += op.length;
      } else if (op.isInsert) {
        newStr.push(op.content);
      } else { // Delete
        strIndex += op.length;
      }
    }

    if (strIndex !== text.length) {
      throw new OTLogicError('The transformation is not valid for the given text.');
    }
    return newStr.join('');
  }

  /**
   * Computes the inverse of an operation. The inverse of an operation is the
   * operation that reverts the effects of the operation, e.g. when you have an
   * operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello "); skip(6);'.
   * @param str
   */
  invert(str: string): TextTransformation {
    const inverted = new TextTransformation();
    inverted.baseLength = this.transformedLength;
    inverted.transformedLength = this.baseLength;

    let strIndex = 0;
    for (const op of this.ops) {
      if (op.isRetain) {
        inverted.retain(op.length);
        strIndex += op.length;
      } else if (op.isInsert) {
        inverted.delete(op.content.length);
      } else { // Delete
        inverted.insert(str.slice(strIndex, strIndex + op.length));
        strIndex += op.length;
      }
    }

    return inverted;
  }

  /**
   * Composes two transformations into one big transformation.
   *
   * `apply(apply(S, A), B) = apply(S, compose(A, B))` must hold.
   * @param other The transformation to compose with this transformation.
   */
  compose(other: TextTransformation): TextTransformation {
    const transf1 = this;
    const transf2 = other;
    if (transf1.transformedLength !== transf2.baseLength) {
      throw new OTLogicError('The base length of the second transformation must be the target length of the first transformation.');
    }

    const composed = new TextTransformation();
    let currOp1: SingleOperation = transf1.ops[0];
    let currOp2: SingleOperation = transf2.ops[0];
    let index1 = 1;
    let index2 = 1;

    while (currOp1 || currOp2) {
      if (currOp1 && currOp1.isDelete) {
        composed.delete(currOp1.length);
        currOp1 = transf1.ops[index1++];
        continue;
      } else if (currOp2 && currOp2.isInsert) {
        composed.insert(currOp2.content);
        currOp2 = transf2.ops[index2++];
        continue;
      }

      if (!currOp1) {
        throw new OTLogicError('Cannot compose operations: first transformation is too short.');
      } else if (!currOp2) {
        throw new OTLogicError('Cannot compose operations: first transformation is too long.');
      }

      if (currOp1.isRetain && currOp2.isRetain) {
        if (currOp1.length > currOp2.length) {
          composed.retain(currOp2.length);
          currOp1.length -= currOp2.length;
          currOp2 = transf2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          composed.retain(currOp1.length);
          currOp1 = transf1.ops[index1++];
          currOp2 = transf2.ops[index2++];
        } else {
          composed.retain(currOp1.length);
          currOp2.length -= currOp1.length;
          currOp1 = transf1.ops[index1++];
        }
      } else if (currOp1.isInsert && currOp2.isDelete) {
        if (currOp1.content.length > currOp2.length) {
          currOp1.content = currOp1.content.slice(currOp2.length);
          currOp2 = transf2.ops[index2++];
        } else if (currOp1.content.length === currOp2.length) {
          currOp1 = transf1.ops[index1++];
          currOp2 = transf2.ops[index2++];
        } else {
          currOp2.length -= currOp1.content.length;
          currOp1 = transf1.ops[index1++];
        }
      } else if (currOp1.isInsert && currOp2.isRetain) {
        if (currOp1.content.length > currOp2.length) {
          composed.insert(currOp1.content.slice(0, currOp2.length));
          currOp1.content = currOp1.content.slice(currOp2.length);
          currOp2 = transf2.ops[index2++];
        } else if (currOp1.content.length === currOp2.length) {
          composed.insert(currOp1.content);
          currOp1 = transf1.ops[index1++];
          currOp2 = transf2.ops[index2++];
        } else {
          composed.insert(currOp1.content);
          currOp2.length -= currOp1.content.length;
          currOp1 = transf1.ops[index1++];
        }
      } else if (currOp1.isRetain && currOp2.isDelete) {
        if (currOp1.length > currOp2.length) {
          composed.delete(currOp2.length);
          currOp1.length -= currOp2.length;
          currOp2 = transf2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          composed.delete(currOp2.length);
          currOp1 = transf1.ops[index1++];
          currOp2 = transf2.ops[index2++];
        } else {
          composed.delete(currOp1.length);
          currOp2.length -= currOp1.length;
          currOp1 = transf1.ops[index1++];
        }
      } else {
        throw new OTLogicError('The operations are not compatible.');
      }
    }

    return composed;
  }

  /**
   * Transforms the current transformation against another transformation.
   *
   * Transform takes two operations A and B that happened concurrently and produces two operations
   * A' and B' (in an array) such that `apply(apply(S, A), B') = apply(apply(S, B), A')`.
   * @param trans1 The transformation to transform.
   * @param trans2 The transformation to transform against.
   */
  static transform(trans1: TextTransformation, trans2: TextTransformation): [TextTransformation, TextTransformation] {
    if (trans1.baseLength !== trans2.baseLength) {
      throw new OTLogicError('The base lengths of the transformations must be equal.');
    }

    const prime1 = new TextTransformation();
    const prime2 = new TextTransformation();
    let currOp1: SingleOperation = trans1.ops[0];
    let currOp2: SingleOperation = trans2.ops[0];
    let index1 = 1;
    let index2 = 1;

    while (currOp1 || currOp2) {
      if (currOp1.isInsert) {
        prime1.insert(currOp1.content);
        prime2.retain(currOp1.content.length);
        currOp1 = trans1.ops[index1++];
        continue;
      } else if (currOp2.isInsert) {
        prime1.retain(currOp2.content.length);
        prime2.insert(currOp2.content);
        currOp2 = trans2.ops[index2++];
        continue;
      }

      if (!currOp1) {
        throw new OTLogicError('Cannot transform operations: first transformation is too short.');
      } else if (!currOp2) {
        throw new OTLogicError('Cannot transform operations: first transformation is too long.');
      }

      if (currOp1.isRetain && currOp2.isRetain) {
        // Case 1: retain/retain
        let minl: number;
        if (currOp1.length > currOp2.length) {
          minl = currOp2.length;
          currOp1.length -= currOp2.length;
          currOp2 = trans2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          minl = currOp2.length;
          currOp1 = trans1.ops[index1++];
          currOp2 = trans2.ops[index2++];
        } else {
          minl = currOp1.length;
          currOp2.length -= currOp1.length;
          currOp1 = trans1.ops[index1++];
        }
        prime1.retain(minl);
        prime2.retain(minl);
      } else if (currOp1.isDelete && currOp2.isDelete) {
        // Case 2: delete/delete -- the order doesn't matter
        if (currOp1.length > currOp2.length) {
          currOp1.length -= currOp2.length;
          currOp2 = trans2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          currOp1 = trans1.ops[index1++];
          currOp2 = trans2.ops[index2++];
        } else {
          currOp2.length -= currOp1.length;
          currOp1 = trans1.ops[index1++];
        }
      } else if (currOp1.isDelete && currOp2.isRetain) {
        // Case 3: delete/retain
        let minl: number;
        if (currOp1.length > currOp2.length) {
          minl = currOp2.length;
          currOp1.length -= currOp2.length;
          currOp2 = trans2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          minl = currOp2.length;
          currOp1 = trans1.ops[index1++];
          currOp2 = trans2.ops[index2++];
        } else {
          minl = currOp1.length;
          currOp2.length -= currOp1.length;
          currOp1 = trans1.ops[index1++];
        }
        prime1.delete(minl);
      } else if (currOp1.isRetain && currOp2.isDelete) {
        // Case 4: retain/delete
        let minl: number;
        if (currOp1.length > currOp2.length) {
          minl = currOp2.length;
          currOp1.length -= currOp2.length;
          currOp2 = trans2.ops[index2++];
        } else if (currOp1.length === currOp2.length) {
          minl = currOp2.length;
          currOp1 = trans1.ops[index1++];
          currOp2 = trans2.ops[index2++];
        } else {
          minl = currOp1.length;
          currOp2.length -= currOp1.length;
          currOp1 = trans1.ops[index1++];
        }
        prime2.delete(minl);
      } else {
        throw new OTLogicError('The operations are not compatible.');
      }
    }

    return [prime1, prime2];
  }
}
