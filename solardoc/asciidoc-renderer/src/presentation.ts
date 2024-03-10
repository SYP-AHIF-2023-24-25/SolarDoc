import { TargetRenderer, AsciidocCompiler, AsciidocFile } from './renderer'
import { RenderOutput } from './renderer'
import { Asciidoctor } from '@asciidoctor/core'
import { PresentationMetadata } from './presentation-metadata'

/**
 * The default title that is used if no title is specified in the asciidoc file.
 * @since 0.3.1
 */
export const DEFAULT_PRESENTATION_TITLE: string = "Unnamed Presentation"

/**
 * A presentation is a collection of slides, which internally are reveal.js slides. These can be converted to HTML,
 * PDFs or images.
 * @since 0.2.0
 */
export class Presentation {
  private readonly _compiler: AsciidocCompiler
  private readonly _sourceFile: AsciidocFile
  private readonly _parsedFile: Asciidoctor.Document
  private readonly _metadata: PresentationMetadata

  public constructor(
    compiler: AsciidocCompiler,
    sourceFile: AsciidocFile,
    parsedFile: Asciidoctor.Document,
  ) {
    this._compiler = compiler
    this._sourceFile = sourceFile
    this._parsedFile = parsedFile
    this._metadata = this.getDocumentMetadata(parsedFile)
  }

  /**
   * The metadata of the presentation.
   * @since 0.2.0
   */
  public get metadata(): PresentationMetadata {
    return this._metadata
  }

  /**
   * The source file that was used to create the presentation.
   * @since 0.2.0
   */
  public get sourceFile(): AsciidocFile {
    return this._sourceFile
  }

  /**
   * The parsed asciidoc file that was generated from the source to create the presentation.
   * @since 0.2.0
   */
  public get parsedFile(): Asciidoctor.Document {
    return this._parsedFile
  }

  /**
   * The source of the asciidoc file that was passed.
   *
   * This is equivalent to {@link this.parsedFile.getSource parsedFile.getSource()}.
   * @since 0.2.0
   */
  public get sourceCode(): string {
    return this.parsedFile.getSource()
  }

  /**
   * The compiler that is used to compile the presentation. It also contains the
   * {@link Asciidoctor asciidoctor} instance that is used to compile the asciidoc files.
   * @since 0.2.0
   */
  public get compiler(): AsciidocCompiler {
    return this._compiler
  }

  /**
   * Renders the presentation to the given target.
   * @param target The target that should be used to render the presentation.
   * @param config The configuration that should be used to render the presentation.
   * @since 0.2.0
   */
  public async render<RawT, OutT>(
    target: TargetRenderer<RawT, OutT>,
    config?: { [key: string]: any },
  ): Promise<RenderOutput<RawT, OutT>> {
    return await target.render(this, config)
  }

  /**
   * Renders a specific presentation slide to the given target.
   * @param target The target that should be used to render the presentation.
   * @param slide The value that specifies the slide.
   * @param config The configuration that should be used to render the presentation.
   * @since 0.3.0
   */
  public async renderSlide<RawT, OutT>(target: TargetRenderer<RawT, OutT>, slide: number,config?: { [key: string]: any },
  ): Promise<RenderOutput<RawT, OutT>> {
    return await target.renderSlide(this,slide, config)
  }

  /**
   * Determines the metadata of the given document.
   * @param document The document of which the metadata should be determined.
   * @since 0.2.0
   */
  private getDocumentMetadata(document: Asciidoctor.Document): PresentationMetadata {

    type MinReqAbstractBlock = Pick<Asciidoctor.AbstractBlock, 'getContext' | 'getBlocks' | 'getLevel'>

    let slides = <Array<MinReqAbstractBlock>>document.getBlocks();
    const preambleExists = slides[0]?.getContext() === 'preamble';
    const nonPreambleFirstSlideExists = !preambleExists && slides[0]?.getLevel() === 0;

    // We have to also check for 'nonPreambleFirstSlideExists' because if the first slide is the only slide and it is
    // also not a preamble slide but a standard slide (paragraphs in asciidoc).
    if (!preambleExists && !nonPreambleFirstSlideExists) {
      slides = [
        {
          getContext: () => 'preamble',
          getBlocks: () => [],
          getLevel: () => 0
        },
        ...slides
      ]
    }

    const subslideCountPerSlide = slides.map((slide: MinReqAbstractBlock) => {
      let subBlocks = <Array<Asciidoctor.AbstractBlock>>slide.getBlocks()
      return subBlocks.filter((block: Asciidoctor.AbstractBlock) => block.getContext() === 'section').length
    })
    const slideCount = subslideCountPerSlide.length
    const slideCountInclSubslides = subslideCountPerSlide.reduce((a, b) => a + b, slideCount)

    const title = document.getDocumentTitle() || DEFAULT_PRESENTATION_TITLE
    return {
      defaultTitle: title === DEFAULT_PRESENTATION_TITLE,
      title: title,
      author: document.getAuthor(),
      slideCount: slideCount,
      slideCountInclSubslides: slideCountInclSubslides,
      subslideCountPerSlide: subslideCountPerSlide,
      originalDocument: document
    } satisfies PresentationMetadata
  }
}
