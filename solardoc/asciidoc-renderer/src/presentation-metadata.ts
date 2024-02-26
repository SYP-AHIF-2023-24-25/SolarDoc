import { Asciidoctor } from '@asciidoctor/core'

export interface PresentationMetadata {
  /**
   * The original document that was used to create the presentation.
   * @since 0.2.0
   */
  originalDocument: Asciidoctor.Document

  /**
   * The title of the presentation.
   * @since 0.2.0
   */
  title: string | Asciidoctor.Document.Title

  /**
   * The author of the presentation.
   * @since 0.2.0
   */
  author?: string

  /**
   * The amount of slides that are in the presentation.
   * @since 0.2.0
   */
  slideCount: number

  /**
   * The amount of main slides that are in the presentation.
   * @since 0.3.0
   */
  slideCountInclSubslides: number

  /**
   * Array displaying the amount of sub slides per slide.
   *
   * The index in the array represents the slide index.
   * @since 0.3.0
   */
  subslideCountPerSlide: number[];

  /**
   * Returns true if the {@link title} is "Untitled Presentation".
   *
   * This is the default title that is used by SolarDoc if no title is specified in the asciidoc file.
   * @since 0.3.1
   */
  defaultTitle: boolean;
}
