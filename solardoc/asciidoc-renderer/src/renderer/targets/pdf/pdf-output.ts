import { RenderOutput } from '../../render-output'
import {Presentation} from "../../../presentation";
import {PDFDocument} from "pdf-lib";

/**
 * Wrapper class for a PDF output.
 * @since 0.2.0
 */
export class PDFOutput extends RenderOutput<PDFDocument, PDFDocument> {
  public constructor(internalData: PDFDocument, source: Presentation) {
    super(internalData, source)

  }

  public get extension(): string {
    return 'pdf'
  }

  /**
   * Converts the content to a file-writable PDF format.
   * @since 0.2.0
   */
  public async write(): Promise<PDFDocument> {
    return this.internalData
  }
}
