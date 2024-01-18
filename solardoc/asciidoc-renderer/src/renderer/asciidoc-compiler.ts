import type { Asciidoctor } from '@asciidoctor/core'
import { AsciidocFile } from './asciidoc-file'
import { Presentation } from '../presentation'
import { loadAsciidoctor } from '../asciidoc-loader'

/**
 * The compiler for {@link AsciidocFile} instances. This compiler will take the given file and compile it into a
 * {@link Presentation presentation}.
 *
 * This compiler will internally call up the functionality from the '@asciidoctor/reveal.js' module to compile the
 * asciidoc file into a reveal.js presentation.
 * @since 0.2.0
 */
export class AsciidocCompiler {
  public static readonly parseOptions = {
    /**
     * The safe mode that should be used to render the document.
     *
     * Read more here: https://docs.asciidoctor.org/asciidoctor/latest/safe-modes/
     */
    safe: 'safe',
    /**
     * The backend that should be used to render the document.
     */
    backend: 'revealjs',
  }

  public readonly asciidoctor: Asciidoctor

  public constructor() {
    this.asciidoctor = loadAsciidoctor()

    // TODO!
    //throw new Error('Not implemented yet!')
  }

  /**
   * Compiles the given asciidoc file into a {@link Presentation presentation}.
   * @param input The asciidoc file which should be compiled.
   * @since 0.2.0
   */
  public async parse(input: AsciidocFile): Promise<Presentation> {
    const document: Asciidoctor.Document = this.asciidoctor.load(
      input.content,
      AsciidocCompiler.parseOptions,
    )
    return new Presentation(this, input, document)
  }
}
