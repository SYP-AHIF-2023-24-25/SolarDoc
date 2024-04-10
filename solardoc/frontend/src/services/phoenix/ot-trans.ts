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
export type RawOTTrans = RawInsertOTTrans | RawDeleteOTTrans

/**
 * A DTO for an operational transformation transaction.
 */
export interface OTTransDTO {
  id: string
  trans: RawOTTrans
  timestamp: number
  user_id: string
}

/**
 * An operational transformation transaction.
 * @since 0.5.0
 */
export interface OTTrans {
  id: string
  trans: RawOTTrans
  timestamp: number | undefined
  user_id: string
  acknowledged: boolean
}
