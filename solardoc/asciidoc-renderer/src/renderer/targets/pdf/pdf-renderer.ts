import { TargetRenderer } from '../target-renderer'
import { Presentation } from '../../../presentation'
import { PDFOutput } from './pdf-output'
import { Slide } from '../../../slide'

/**
 * Renders a presentation or slide to a PDF file.
 * @since 0.2.0
 */
export class PDFRenderer extends TargetRenderer<PDFOutput> {
  public constructor() {
    super()
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders the given {@link Presentation presentation} to the PDF format.
   * @param presentation The presentation that should be rendered.
   */
  public async render(presentation: Presentation): Promise<PDFOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to the PDF format.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   */
  public renderSlide(presentation: Presentation, slide: number | Slide): Promise<PDFOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
