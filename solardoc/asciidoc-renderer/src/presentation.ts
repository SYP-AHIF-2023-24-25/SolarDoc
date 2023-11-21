import type {TargetRenderer, AsciidocCompiler} from './renderer'

/**
 * A presentation is a collection of slides, which internally are reveal.js slides. These can be converted to HTML,
 * PDFs or images.
 * @since 0.2.0
 */
export class Presentation {
  private readonly _compiler: AsciidocCompiler;

  public constructor(compiler: AsciidocCompiler) {
    this._compiler = compiler;

    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * The compiler that is used to compile the presentation. It also contains the
   * {@link Asciidoctor asciidoctor} instance that is used to compile the asciidoc files.
   * @since 0.2.0
   */
  public get compiler(): AsciidocCompiler {
    return this._compiler;
  }

  /**
   * Renders the presentation to the given target.
   * @param target The target that should be used to render the presentation.
   * @since 0.2.0
   */
  public async render<T>(target: TargetRenderer<T>): Promise<void> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
