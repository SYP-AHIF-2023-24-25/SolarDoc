import type { PDFByteArray } from './pdf-renderer'
import { RenderOutput } from '../../render-output'
import { Presentation } from '../../../presentation'
import { PDFDocument } from 'pdf-lib'

/**
 * Wrapper class for a PDF output.
 * @since 0.2.0
 */
export class PDFOutput extends RenderOutput<PDFDocument, PDFByteArray> {
  public constructor(internalData: PDFDocument, source: Presentation) {
    super(internalData, source)
  }

  public get extension(): string {
    return 'pdf'
  }

  /**
   * Converts the content to a file-writable PDF format. There are a number of things you can do with the serialized
   * document, depending on the JavaScript environment you're running in:
   * * Write it to a file in Node or React Native
   * * Download it as a Blob in the browser
   * * Render it in an `iframe`
   * @since 0.2.0
   */
  public async write(): Promise<PDFByteArray> {
    return this.internalData.save()
  }
}
