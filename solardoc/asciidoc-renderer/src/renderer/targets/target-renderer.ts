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
   * @param config The configuration for the target renderer.
   * @since 0.2.0
   */
  public abstract render(presentation: Presentation, config?: { [key: string]: any }): Promise<RenderOutput<RawT, OutT>>

  /**
   * Renders a single {@link Slide slide} of the presentation.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered.
   * @param config The configuration for the target renderer.
   * @since 0.2.0
   */
  public abstract renderSlide(
    presentation: Presentation,
    slide: Slide,
    config?: { [key: string]: any }
  ): Promise<RenderOutput<RawT, OutT>>

  /**
   * Renders a single {@link Slide slide} of the presentation.
   * @param presentation The presentation that should be rendered.
   * @param slide The index of the slide that should be rendered.
   * @param config The configuration for the target renderer.
   * @since 0.2.0
   */
  public abstract renderSlide(
    presentation: Presentation,
    slide: number,
    config?: { [key: string]: any }
  ): Promise<RenderOutput<RawT, OutT>>
}
