import { RenderOutput } from '../../render-output'
import { Presentation } from '../../../presentation'

/**
 * Wrapper class for an image output.
 * @since 0.2.0
 */
export class ImageOutput extends RenderOutput<Buffer[], Buffer[]> {
  public constructor(internalData: Buffer[], source: Presentation) {
    super(internalData, source)
  }

  public get extension(): string {
    return 'png'
  }

  /**
   * Converts the content to a file-writable image format.
   * @since 0.2.0
   */
  public async write(): Promise<Buffer[]> {
    return this.internalData
  }
}
