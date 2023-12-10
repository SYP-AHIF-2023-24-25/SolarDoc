import { RenderOutput } from '../../render-output'

/**
 * Wrapper class for an HTML output.
 * @since 0.2.0
 */
export class HTMLOutput extends RenderOutput<string, string> {
  public constructor(internalData: string) {
    super(internalData)
  }

  /**
   * Converts the content to a file-writable HTML format.
   *
   * In this case the {@link HTMLOutput.internalData internalData} is returned, as it already
   * in the correct format.
   * @since 0.2.0
   */
  public async write(): Promise<string> {
    return this.internalData
  }
}
