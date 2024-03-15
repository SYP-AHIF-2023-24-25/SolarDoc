import type {
  EditorChannel as APIEditorChannel,
  UserTrusted,
} from '@/services/phoenix/gen/phoenix-rest-service'

/**
 * A SDS channel, which can be joined to receive updates for a specific document from the server.
 * @since 0.4.0
 */
export interface EditorChannel extends APIEditorChannel {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly active_since: number
  readonly creator: UserTrusted
}

/**
 * A Solardoc WebSocket channel that can be created by a user.
 * @since 0.4.0
 */
export interface CreateEditorChannel {
  readonly name: string
  readonly description: string
  readonly password: string
  readonly creator: string
}

/**
 * Options for joining a channel.
 * @since 0.4.0
 */
export interface JoinChannelOptions {
  readonly auth: string
}
