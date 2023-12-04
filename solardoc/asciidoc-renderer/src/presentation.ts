import type { TargetRenderer, AsciidocCompiler } from './renderer'
import { RenderOutput } from './renderer'
import { Asciidoctor } from '@asciidoctor/core'

/**
 * A presentation is a collection of slides, which internally are reveal.js slides. These can be converted to HTML,
 * PDFs or images.
 * @since 0.2.0
 */
export class Presentation {
  private readonly _compiler: AsciidocCompiler
  private readonly _parsedFile: Asciidoctor.Document

  public constructor(compiler: AsciidocCompiler, parsedFile: Asciidoctor.Document) {
    this._compiler = compiler
    this._parsedFile = parsedFile

    // TODO!
    //throw new Error('Not implemented yet!')
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
}
