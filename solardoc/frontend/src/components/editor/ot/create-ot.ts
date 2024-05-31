import type { OTransReqDto } from '@/services/phoenix/ot-trans'
import {createDeleteOTrans, createInsertOTrans} from '@/services/phoenix/ot-trans'
import { editor } from 'monaco-editor'

export async function createOTUpdates(changes: Array<editor.IModelContentChange>): Promise<Array<Array<OTransReqDto>>> {
  // We will create for every change a new OT operation
  // To do this though we will need to translate the monaco editor changes to OT operations
  // This is simple if we simply assume that empty text means deletion and non-empty text means insertion
  const changeOTs: Array<Array<OTransReqDto>> = []
  for (const change of changes) {
    const ots: Array<OTransReqDto> = []
    if (change.text === '') {
      const length = change.rangeLength
      const pos = change.rangeOffset + length
      ots.push(createDeleteOTrans(pos, length))
    } else {
      const pos = change.rangeOffset
      // Check if we potentially deleted text using the insert operation
      if (change.rangeLength > 0) {
        const length = change.rangeLength
        const pos = change.rangeOffset + length
        ots.push(createDeleteOTrans(pos, length))
      }
      ots.push(createInsertOTrans(pos, change.text))
    }
    changeOTs.push(ots)
  }
  return changeOTs
}
