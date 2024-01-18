import { RenderOutput } from '../../render-output'
import { Presentation } from '../../../presentation'

/**
 * Wrapper class for an image output.
 * @since 0.2.0
 */
export class ImageOutput extends RenderOutput<unknown, unknown> {
  public constructor(internalData: unknown, source: Presentation) {
    super(internalData, source)
  }

  public get extension(): string {
    return 'png' // TODO! Verify this once we have a proper implementation
  }

  /**
   * Converts the content to a file-writable image format.
   * @since 0.2.0
   */
  public async write(): Promise<unknown> {
    return this.internalData
  }
}
