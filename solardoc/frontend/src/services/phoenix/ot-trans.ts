/**
 * A raw operational transformation which inserts text.
 */
export interface RawInsertOTrans {
  readonly type: 'insert'
  readonly pos: number
  readonly content: string
}

/**
 * A raw operational transformation which deletes text.
 */
export interface RawDeleteOTrans {
  readonly type: 'delete'
  readonly pos: number
  readonly length: number
}

/**
 * A raw operational transformation.
 */
export type RawOTrans = RawInsertOTrans | RawDeleteOTrans

/**
 * A DTO for an operational transformation transaction request.
 *
 * This will be sent to the server and then returned as a full transaction in form of {@link OTransRespDTO}.
 */
export interface OTransReqDto {
  id: string
  trans: RawOTrans
}

/**
 * A DTO for an operational transformation transaction response.
 *
 * This will be sent to the client and then stored in the local database.
 */
export interface OTransRespDto {
  id: string
  trans: RawOTrans
  timestamp: number
  user_id: string
}

/**
 * An operational transformation transaction.
 * @since 0.5.0
 */
export interface OTrans {
  id: string
  trans: RawOTrans
  timestamp: number | undefined
  user_id: string
  acknowledged: boolean
  init: boolean
}
