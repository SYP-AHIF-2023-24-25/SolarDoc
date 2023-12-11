/**
 * Configuration options for the HTML renderer.
 * @since 0.2.0
 */
export interface HTMLRendererConfig {
  /**
   * The path that should be prepended to all JS dependencies that are loaded by the reveal.js library.
   *
   * This is to allow for a custom directory other than 'node_modules/reveal.js/' to be used.
   * @since 0.2.0
   */
  revealJSAssetsPath?: string
}
