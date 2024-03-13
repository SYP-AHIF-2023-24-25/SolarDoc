import type { UserPrivate, UserPublic } from '@/services/phoenix/gen/phoenix-rest-service'

/**
 * A SDS channel, which can be joined to receive updates for a specific document from the server.
 * @since 0.4.0
 */
export interface EditorChannel {
  readonly id: number
  readonly name: string
  readonly description: string
  readonly activeSince: number
  readonly creator: UserPublic | UserPrivate
}

/**
 * A Solardoc WebSocket channel that can be created by a user.
 * @since 0.4.0
 */
export interface CreateEditorChannel {
  readonly name: string
  readonly description: string
  readonly password: string
}
