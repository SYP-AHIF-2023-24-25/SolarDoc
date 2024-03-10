import { TargetRenderer } from '../target-renderer'
import { Presentation } from '../../../presentation'
import { PDFDocument } from 'pdf-lib'
import { PDFOutput } from './pdf-output'
import { DecktapeSlim } from '../../simulator'
import { HTMLRenderer } from '../html'

/**
 * A byte array that represents a PDF file.
 * @since 0.3.0
 */
export type PDFByteArray = Uint8Array

/**
 * Renders a presentation or slide to a PDF file.
 *
 * This is node-specific, and will not work in the browser.
 * @since 0.2.0
 */
export class PDFRenderer extends TargetRenderer<PDFDocument, PDFByteArray> {
  /**
   * Renders the given {@link Presentation presentation} to the PDF format.
   *
   * This is node-specific, and will not work in the browser.
   * @param presentation The presentation that should be rendered.
   * @param config The configuration for the PDF renderer.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async render(
    presentation: Presentation,
    config?: { [key: string]: any },
  ): Promise<PDFOutput> {
    const revealJsHtml = await presentation.render(new HTMLRenderer(), config)
    const decktapeSimulator = new DecktapeSlim()
    const pdf: PDFDocument = await decktapeSimulator.renderRJSHTMLToPDF(await revealJsHtml.write(),presentation.metadata)
    return new PDFOutput(pdf, presentation)
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to the PDF format.
   *
   * This is node-specific, and will not work in the browser.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   * @param config The configuration for the PDF renderer.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderSlide(
    presentation: Presentation,
    slide: number,
    config?: { [key: string]: any },
  ): Promise<PDFOutput> {
    let revealJsHtml = await presentation.renderSlide(new HTMLRenderer(), slide, config)
    const decktapeSimulator = new DecktapeSlim()
    const pdf: PDFDocument = await decktapeSimulator.renderRJSHTMLToPDF(
      await revealJsHtml.write(),
      presentation.metadata,slide
    )
    return new PDFOutput(pdf, presentation)
  }
}
