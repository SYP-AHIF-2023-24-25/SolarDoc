import type {Selection} from "@/scripts/editor/ot/core/selection";
import type {TextOperation} from "@/scripts/editor/ot/text-operation";
import {BaseMeta} from "@/scripts/editor/ot/meta/base-meta";

/**
 * Represents the meta information for a remote client.
 * @since 1.0.0
 */
export class OtherMeta extends BaseMeta {
  private readonly _clientId: string
  private readonly _selection: Selection

  constructor(clientId: string, selection: Selection) {
    this._clientId = clientId
    this._selection = selection
  }

  get clientId(): string {
    return this._clientId
  }

  get selection(): Selection {
    return this._selection
  }

  transform(operation: TextOperation): OtherMeta {
    return new OtherMeta(this._clientId, this._selection.transform(operation))
  }
}
