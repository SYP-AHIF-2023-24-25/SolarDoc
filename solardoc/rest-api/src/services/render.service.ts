import { BindingScope, injectable } from '@loopback/core'

// Import render library
import {
  AsciidocCompiler,
  AsciidocFile,
  HTMLOutput,
  HTMLRenderer,
  Presentation,
} from '@solardoc/asciidoc-renderer'
import fs from 'fs/promises'

@injectable({ scope: BindingScope.TRANSIENT })
export class RenderService {
  private readonly _compiler: AsciidocCompiler

  constructor() {
    this._compiler = new AsciidocCompiler()
  }

  /**
   * Get the initialised compiler instance.
   * @since 0.2.0
   */
  public get compiler(): AsciidocCompiler {
    return this._compiler
  }

  /**
   * Renders an Asciidoc presentation to a reveal.js HTML presentation.
   * @param fileName The name of the file.
   * @param fileContent The content of the file.
   * @returns The output object containing the metadata as well as the output HTML.
   * @since 0.2.0
   */
  public async renderRJSHTMLPresentation(
    fileName: string,
    fileContent: string,
  ): Promise<HTMLOutput> {
    const file: AsciidocFile = await AsciidocFile.fromString(fileName, fileContent)
    const presentation: Presentation = await this.compiler.parse(file)
    return presentation.render(new HTMLRenderer())
  }
}
