import { Presentation } from '../../presentation'
import { Slide } from '../../slide'
import { RenderOutput } from '../render-output'

/**
 * The render target is used to render a presentation to a specific format, i.e. HTML, PDF or images.
 * @since 0.2.0
 */
export abstract class TargetRenderer<RawT, OutT> {
  public constructor() {
    // TODO!
    //throw new Error('Not implemented yet!')
  }

  /**
   * Renders the given {@link Presentation presentation} to the target format.
   * @param presentation The presentation that should be rendered.
   */
  public abstract render(presentation: Presentation): Promise<RenderOutput<RawT, OutT>>

  /**
   * Renders a single {@link Slide slide} of the presentation.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered.
   */
  public abstract renderSlide(
    presentation: Presentation,
    slide: Slide
  ): Promise<RenderOutput<RawT, OutT>>

  /**
   * Renders a single {@link Slide slide} of the presentation.
   * @param presentation The presentation that should be rendered.
   * @param slide The index of the slide that should be rendered.
   */
  public abstract renderSlide(
    presentation: Presentation,
    slide: number
  ): Promise<RenderOutput<RawT, OutT>>
}
