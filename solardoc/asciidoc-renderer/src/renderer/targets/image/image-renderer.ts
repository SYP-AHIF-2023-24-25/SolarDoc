import { ImageOutput } from './image-output'
import { TargetRenderer } from '../target-renderer'
import { Presentation } from '../../../presentation'
import { HTMLRenderer } from '../html'
import { DecktapeSlim } from '../../simulator'

/**
 * Renders a presentation or slide to an image file.
 * @since 0.2.0
 */
export class ImageRenderer extends TargetRenderer<Buffer[], Buffer[]> {
  public constructor() {
    super()
  }

  /**
   * Renders the given {@link Presentation presentation} to a collection of images (one per slide).
   * @param presentation The presentation that should be rendered.
   * @param config The configuration for the image renderer.
   */
  public async render(
    presentation: Presentation,
    config?: { [key: string]: any },
  ): Promise<ImageOutput> {
    const revealJsHtml = await presentation.render(new HTMLRenderer(), config)
    const decktapeSimulator = new DecktapeSlim()
    const img: Buffer[] = await decktapeSimulator.renderRJSHTMLToImage(
      await revealJsHtml.write(),
      'png',
      presentation.metadata,
    )
    return new ImageOutput(img, presentation)
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to an image.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   * @param config The configuration for the image renderer.
   * @since 0.2.0
   */
  public async renderSlide(
    presentation: Presentation,
    slide: number,
    config?: { [key: string]: any },
  ): Promise<ImageOutput> {
    let revealJsHtml = await presentation.renderSlide(new HTMLRenderer(), slide, config)
    const decktapeSimulator = new DecktapeSlim()
    const img: Buffer[] = await decktapeSimulator.renderRJSHTMLToImage(
      await revealJsHtml.write(),
      'png',
      presentation.metadata,
      slide,
    )
    return new ImageOutput(img, presentation)
  }
}
