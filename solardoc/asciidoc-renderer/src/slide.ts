import { TargetRenderer } from './renderer/targets/target-renderer'

/**
 * A slide is a single slide of a presentation, which internally is a reveal.js slide. These can be converted to HTML,
 * PDFs or images.
 * @since 0.2.0
 */
export class Slide {
  public constructor() {
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders the slide to the given target.
   * @param target The target that should be used to render the slide.
   */
  public async render<T>(target: TargetRenderer<T, T>): Promise<void> {
    // TODO!
    //throw new Error('Not implemented yet!')
  }
}
