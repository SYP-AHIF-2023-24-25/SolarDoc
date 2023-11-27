import { RenderOutput } from '../../render-output'

/**
 * Wrapper class for a PDF output.
 * @since 0.2.0
 */
export class PDFOutput extends RenderOutput<unknown, unknown> {
  // TODO! Properly type the generics
  public constructor(content: unknown) {
    // TODO! Properly type the raw content.
    super(content)

    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Converts the content to a file-writable PDF format.
   * @since 0.2.0
   */
  public async write(): Promise<unknown> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
