import type { Presentation } from '../../../../presentation'
import { PDFOutput } from '../pdf-output'
import { TargetRenderer } from '../../target-renderer'
import { Slide } from '../../../../slide'

/**
 * Renders a presentation or slide to a PDF file.
 *
 * This is node-specific, and will not work in the browser.
 * @since 0.2.0
 */
export class NodePDFRenderer extends TargetRenderer<unknown, unknown> {
  /**
   * Renders the given {@link Presentation presentation} to the PDF format.
   *
   * This is node-specific, and will not work in the browser.
   * @param presentation The presentation that should be rendered.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async render(presentation: Presentation): Promise<PDFOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to the PDF format.
   *
   * This is node-specific, and will not work in the browser.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderSlide(presentation: Presentation, slide: number | Slide): Promise<PDFOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}