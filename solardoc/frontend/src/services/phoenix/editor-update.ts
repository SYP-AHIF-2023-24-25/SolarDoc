/**
 * The object which can be sent and received from the SDS over an editor channel.
 * @since 0.4.0
 */
export interface EditorUpdate {
  /**
   * The body of the editor
   */
  body: string
  /**
   * The URL of the API render request
   */
  render_url: string
}
