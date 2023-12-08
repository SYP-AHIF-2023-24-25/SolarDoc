import { RenderOutput } from '../../render-output'

/**
 * Wrapper class for an HTML output.
 * @since 0.2.0
 */
export class HTMLOutput extends RenderOutput<string, string> {
  public constructor(internalData: string) {
    super(internalData)

    // TODO!
    // throw new Error('Not implemented yet!')
  }

  /**
   * Converts the content to a file-writable HTML format.
   * @since 0.2.0
   */
  public async write(): Promise<string> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
