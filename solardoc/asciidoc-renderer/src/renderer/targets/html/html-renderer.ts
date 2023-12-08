import { TargetRenderer } from '../target-renderer'
import { HTMLOutput } from './html-output'
import { Presentation } from '../../../presentation'
import { Slide } from '../../../slide'
import { Asciidoctor } from '@asciidoctor/core'
import { InternalError } from '../../../errors'

/**
 * Renders a presentation or slide to an image file.
 * @since 0.2.0
 */
export class HTMLRenderer extends TargetRenderer<unknown, unknown> {
  private static readonly renderOptions = {
    /**
     * The safe mode that should be used to render the document.
     *
     * Read more here: https://docs.asciidoctor.org/asciidoctor/latest/safe-modes/
     */
    safe: 'safe',
    /**
     * The backend that should be used to render the document.
     */
    backend: 'revealjs',
    /**
     * Standalone hints to the processor that the document requires a full document render.
     *
     * This is to ensure it doesn't just return an empty string when rendering a full document.
     * @since 0.2.0
     */
    standalone: true
  } satisfies Asciidoctor.ProcessorOptions

  public constructor() {
    super()
    // TODO!
    //throw new Error('Not implemented yet!')
  }

  /**
   * Renders the given {@link Presentation presentation} to a reveal.js HTML presentation.
   * @param presentation The presentation that should be rendered.
   * @since 0.2.0
   */
  public async render(presentation: Presentation): Promise<HTMLOutput> {
    // TODO!
    let htmlOutput = presentation.parsedFile.convert(HTMLRenderer.renderOptions)
    if (typeof htmlOutput !== 'string') {
      throw new InternalError(
        `HTML output is not a string! Potential bug in asciidoctor.js! (Input: ${presentation.sourceCode})`
      )
    }
    return new HTMLOutput(htmlOutput)
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to a reveal.js HTML slide (one-slide presentation).
   *
   * IMPORTANT! This may not be needed, but for completeness, it is here. Whether it's actually implemented or not
   * will be decided later.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   * @since 0.2.0
   */
  public renderSlide(presentation: Presentation, slide: number | Slide): Promise<HTMLOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
