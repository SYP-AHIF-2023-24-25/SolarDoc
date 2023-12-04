import { RenderOutput } from '../../render-output'

/**
 * Wrapper class for an image output.
 * @since 0.2.0
 */
export class ImageOutput extends RenderOutput<unknown, unknown> {
  // TODO! Properly type the generics
  public constructor(internalData: unknown) {
    // TODO! Properly type the raw content.
    super(internalData)

    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Converts the content to a file-writable image format.
   * @since 0.2.0
   */
  public async write(): Promise<unknown> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
