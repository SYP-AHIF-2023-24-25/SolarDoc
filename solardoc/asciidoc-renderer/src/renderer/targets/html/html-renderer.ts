import { TargetRenderer } from '../target-renderer'
import { HTMLOutput } from './html-output'
import { Presentation } from '../../../presentation'
import { Slide } from '../../../slide'

/**
 * Renders a presentation or slide to an image file.
 * @since 0.2.0
 */
export class HTMLRenderer extends TargetRenderer<unknown, unknown> {
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
    let htmlOutput = presentation.compiler.asciidoctor.convert(presentation.parsedFile.getSource());
    if(typeof htmlOutput === "string"){
      return new HTMLOutput(htmlOutput);
    }
    return new HTMLOutput("no string");

    //throw new Error('Not implemented yet!')
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
