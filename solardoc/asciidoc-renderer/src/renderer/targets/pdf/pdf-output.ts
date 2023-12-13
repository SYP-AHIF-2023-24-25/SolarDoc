import { RenderOutput } from '../../render-output'
import {Presentation} from "../../../presentation";

/**
 * Wrapper class for a PDF output.
 * @since 0.2.0
 */
export class PDFOutput extends RenderOutput<unknown, unknown> {
  // TODO! Properly type the generics
  public constructor(internalData: unknown, source: Presentation) {
    super(internalData, source)

    // TODO!
    throw new Error('Not implemented yet!')
  }

  public get extension(): string {
    return 'pdf'
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
