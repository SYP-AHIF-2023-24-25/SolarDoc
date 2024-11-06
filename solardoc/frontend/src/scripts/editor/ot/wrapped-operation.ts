import type {TextOperation} from "@/scripts/editor/ot/text-operation";

/**
 * Represents a transformation that can be applied to a text.
 * @since 1.0.0
 */
export class WrappedOperation {
  constructor(public readonly operation: TextOperation, public readonly meta: any) {}

  /**
   * Calls the wrapped {@link TextOperation.apply} operation.
   * @param text The text to apply the operation to.
   */
  apply(text: string): string {
    return this.operation.apply(text)
  }

  /**
   * Calls the wrapped {@link TextOperation.invert} operation and creates a new {@link WrappedOperation} with the
   * inverted operation.
   * @param text The text to invert the operation on.
   */
  invert(text: string): WrappedOperation {
    return new WrappedOperation(this.operation.invert(text), this.meta)
  }
}
