import type { OTrans, OTransReqDto, RawOTrans } from '@/services/phoenix/ot-trans'

/**
 * Transform takes two operations A and B that happened concurrently and
 * produces two operations A' and B' (in an array) such that
 * `apply(apply(S, A), B') = apply(apply(S, B), A')`.
 *
 * This function is the heart of OT.
 * @param op1 The first operation.
 * @param op2 The second operation.
 */
export function transformOT(op1: RawOTrans, op2: RawOTrans): [RawOTrans, RawOTrans] {
  if (op1.type === 'insert' && op2.type === 'insert') {
    return transformInsertInsert(op1, op2)
  } else if (op1.type === 'insert' && op2.type === 'delete') {
    return transformInsertDelete(op1, op2)
  } else if (op1.type === 'delete' && op2.type === 'insert') {
    return transformDeleteInsert(op1, op2)
  } else if (op1.type === 'delete' && op2.type === 'delete') {
    return transformDeleteDelete(op1, op2)
  } else {
    throw new Error(`Unknown operation types: ${op1.type} and ${op2.type}`)
  }
}
