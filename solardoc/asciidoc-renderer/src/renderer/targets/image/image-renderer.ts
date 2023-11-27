import { ImageOutput } from './image-output'
import { TargetRenderer } from '../target-renderer'
import { Presentation } from '../../../presentation'
import { Slide } from '../../../slide'

/**
 * Renders a presentation or slide to an image file.
 * @since 0.2.0
 */
export class ImageRenderer extends TargetRenderer<ImageOutput> {
  public constructor() {
    super()
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders the given {@link Presentation presentation} to a collection of images (one per slide).
   * @param presentation The presentation that should be rendered.
   */
  public async render(presentation: Presentation): Promise<ImageOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to an image.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   */
  public renderSlide(presentation: Presentation, slide: number | Slide): Promise<ImageOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
