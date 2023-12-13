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
   * @since 0.2.0
   */
  mainSlideCount: number
}
