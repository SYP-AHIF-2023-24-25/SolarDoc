import { RenderOutput } from '../../render-output'
import {Presentation} from "../../../presentation";

/**
 * Wrapper class for an image output.
 * @since 0.2.0
 */
export class ImageOutput extends RenderOutput<unknown, unknown> {
  // TODO! Properly type the generics
  public constructor(internalData: unknown, source: Presentation) {
    super(internalData, source)

    // TODO!
    throw new Error('Not implemented yet!')
  }

  public get extension(): string {
    return 'png' // TODO! Verify this once we have a proper implementation
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
