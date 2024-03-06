/**
 * A Solardoc WebSocket channel, which can be joined to receive updates for a specific document from the server.
 * @since 0.4.0
 */
export interface Channel {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly activeSince: number;
  readonly creator: string;
}
