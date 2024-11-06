import type {SolardocEditor} from "@/scripts/editor/solardoc-editor";
import type {EditorClient} from "@/scripts/editor/ot/editor-client";
import {Selection, Range} from "@/scripts/editor/ot/core/selection";

/**
 * The adapter for the editor that allows the {@link OTBaseClient} to interact with the editor.
 *
 * This fundamentally interacts with the base editor class {@link SolardocEditor}, which handles all basic Monaco editor
 * operations.
 * @since 1.0.0
 */
export class EditorOTAdapter {
  private readonly _otherSelections: Record<string, Selection>
  private _selection: Selection | undefined

  constructor() {
    this._otherSelections = {}
    this._selection = undefined
  }

  setOtherSelection(id: string, selection: Selection): void {
    this._otherSelections[id] = selection
    this.rerenderSelections()
  }

  removeOtherSelection(id: string): void {
    delete this._otherSelections[id]
    this.rerenderSelections()
  }

  private rerenderSelections() {
    const selectionsToRender = this._otherSelections.map(selection => selection.value)
    SolardocEditor.setSelections(selectionsToRender)
  }

  /**
   * Registers the callbacks for the editor adapter and allows the editor to interact with the server.
   * @param editorClient The editor client to interact with.
   */
  registerCallbacks(editorClient: EditorClient) {
    // TODO!
  }

  /**
   * Gets the current selection with all the current ranges in the editor.
   * @since 1.0.0
   */
  getSelection(): Selection {
    const model = SolardocEditor.monacoEditor.getModel()
    const selections = SolardocEditor.getSelections()
    return new Selection(selections.map(selection => {
      const start = selection.getStartPosition()
      const end = selection.getEndPosition()
      return new Range(model!.getOffsetAt(start), model!.getOffsetAt(end))
    }))
  }
}
