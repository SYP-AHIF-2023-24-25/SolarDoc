import type { TargetRenderer, AsciidocCompiler } from './renderer'
import { RenderOutput } from './renderer'
import { Asciidoctor } from '@asciidoctor/core'
import { PresentationMetadata } from './presentation-metadata'

/**
 * A presentation is a collection of slides, which internally are reveal.js slides. These can be converted to HTML,
 * PDFs or images.
 * @since 0.2.0
 */
export class Presentation {
  private readonly _compiler: AsciidocCompiler
  private readonly _parsedFile: Asciidoctor.Document
  private readonly _metadata: PresentationMetadata

  public constructor(compiler: AsciidocCompiler, parsedFile: Asciidoctor.Document) {
    this._compiler = compiler
    this._parsedFile = parsedFile
    this._metadata = this.getDocumentMetadata(parsedFile)

    // TODO!
    //throw new Error('Not implemented yet!')
  }

  /**
   * The metadata of the presentation.
   * @since 0.2.0
   */
  public get metadata(): PresentationMetadata {
    return this._metadata
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
   * @since 0.2.0
   */
  public async render<RawT, OutT>(
    target: TargetRenderer<RawT, OutT>
  ): Promise<RenderOutput<RawT, OutT>> {
    // TODO! Finish implementation and add remaining tests
    return await target.render(this)
  }

  /**
   * Determines the metadata of the given document.
   * @param document The document of which the metadata should be determined.
   * @since 0.2.0
   */
  private getDocumentMetadata(document: Asciidoctor.Document): PresentationMetadata {
    // TODO!
    const metadata: PresentationMetadata = {
      title: document.getDocumentTitle(),
      author: document.getAuthor(),
      slideCount: 0,
      mainSlideCount: 0,
      originalDocument: document
    }

    let slides = document.getBlocks();
    metadata.mainSlideCount = slides.length;
    metadata.slideCount = slides.length;
    for(let slide in slides) {
      let subBlocks = slides[slide].getBlocks();
      let subSlideCount = subBlocks.filter((block: { getContext: () => string }) => block.getContext() === 'section').length;
      metadata.slideCount += subSlideCount;
    }

    return metadata
  }
}
