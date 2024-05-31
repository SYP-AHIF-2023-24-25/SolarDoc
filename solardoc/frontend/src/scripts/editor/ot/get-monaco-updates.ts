import type {editor} from 'monaco-editor'
import * as monaco from 'monaco-editor'
import type {OTrans} from '@/services/phoenix/ot-trans'

export function getMonacoUpdatesFromOT(
  model: monaco.editor.ITextModel,
  oTrans: OTrans,
): Array<editor.IIdentifiedSingleEditOperation> {
  const edits: Array<editor.IIdentifiedSingleEditOperation> = []

  // We need to translate the single dimension OT operation to monaco editor edits using ranges
  // We will need to split the operation into multiple operations if it spans multiple lines
  if (oTrans.trans.type === 'insert') {
    const position = model.getPositionAt(oTrans.trans.pos)
    edits.push({
      range: new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      ),
      text: oTrans.trans.content,
      forceMoveMarkers: true,
    })
  } else {
    const start = model.getPositionAt(oTrans.trans.pos - oTrans.trans.length)
    const end = model.getPositionAt(oTrans.trans.pos)

    if (start.lineNumber === end.lineNumber) {
      edits.push({
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        text: null,
      })
    } else {
      for (let lineNumber = start.lineNumber; lineNumber <= end.lineNumber; lineNumber++) {
        let startColumn = lineNumber === start.lineNumber ? start.column : 1
        const endColumn =
          lineNumber === end.lineNumber ? end.column : model.getLineMaxColumn(lineNumber)

        let startLineNumber = lineNumber
        const endLineNumber = lineNumber

        // We also need to make sure if the line is completely deleted, we need to also delete the newline character
        // We do this by checking if the line is not the first line and the start column is 1
        if (lineNumber !== start.lineNumber && startColumn === 1) {
          startLineNumber--
          startColumn = model.getLineMaxColumn(startLineNumber)
        }

        edits.push({
          range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
          text: null,
        })
      }
    }
  }
  return edits
}
