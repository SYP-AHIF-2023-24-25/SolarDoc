/**
 * A raw operational transformation which inserts text.
 */
export interface RawInsertOTTrans {
  readonly type: "insert"
  readonly pos: number
  readonly content: string
}

/**
 * A raw operational transformation which deletes text.
 */
export interface RawDeleteOTTrans {
  readonly type: "delete"
  readonly pos: number
  readonly length: number
}

/**
 * A raw operational transformation.
 */
export interface RawOTTrans {
  readonly id: string
  readonly trans: RawInsertOTTrans | RawDeleteOTTrans
}

/**
 * An operational transformation transaction.
 * @since 0.5.0
 */
export interface OTTrans {
  timestamp: number | undefined
  acknowledged: boolean
  readonly rawTrans: RawOTTrans
}
