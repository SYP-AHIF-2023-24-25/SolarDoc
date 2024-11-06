import type {Selection} from "@/scripts/editor/ot/core/selection";
import type {TextOperation} from "@/scripts/editor/ot/text-operation";
import {EditorOTAdapter} from "@/scripts/editor/editor-ot-adapter";

export class OtherClient {
  private readonly _clientId: string
  private readonly _editorAdapter: EditorOTAdapter
  private _selection: Selection | undefined
  private _name: string

  constructor(
    clientId: string,
    editorAdapter: EditorOTAdapter,
    selection: Selection | undefined,
    name: string,
  ) {
    this._clientId = clientId
    this._editorAdapter = editorAdapter
    this._selection = selection
    this._name = name

    if (selection) {
      this.updateSelection(selection)
    }
  }

  get clientId(): string {
    return this._clientId
  }

  get editorAdapter(): EditorOTAdapter {
    return this._editorAdapter
  }

  get selection(): Selection {
    return this._selection
  }

  get name(): string {
    return this._name
  }

  set name(name: string): void {
    this._name = name
  }

  updateSelection(selection: Selection): void {
    this.removeSelection()
    this._selection = selection
    this._editorAdapter.setOtherSelection(this.clientId, selection)
  }

  /**
   * Removes the client from the editor.
   */
  remove(): void {
    this.removeSelection()
  }

  private removeSelection(): void {
    this._editorAdapter.removeOtherSelection(this.clientId)
  }
}
