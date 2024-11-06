import type {TextOperation} from "@/scripts/editor/ot/text-operation";

/**
 * Represents the base meta information for a document.
 * @since 1.0.0
 */
export class BaseMeta {
  abstract transform(operation: TextOperation): BaseMeta
}
