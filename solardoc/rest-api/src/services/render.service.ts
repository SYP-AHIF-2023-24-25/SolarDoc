import { BindingScope, injectable } from '@loopback/core'

// Import render library
import {
  AsciidocCompiler,
  AsciidocFile,
  HTMLOutput,
  HTMLRenderer,
  ImageOutput,
  ImageRenderer,
  PDFOutput,
  PDFRenderer,
  Presentation,
} from '@solardoc/asciidoc-renderer'

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
   * Renders an Asciidoc presentation to either a reveal.js HTML presentation, Images or PDF
   * depending on the TargetRenderer
   * @param fileName The name of the file.
   * @param fileContent The content of the file.
   * @param revealJSAssetsPath The path to the reveal.js assets.
   * @param target The TargetRenderer
   * @returns The output object containing the metadata as well as the output HTML.
   * @since 0.2.0
   */
  public async renderRJSHTMLPresentation(
    fileName: string,
    fileContent: string,
    revealJSAssetsPath?: string,
  ): Promise<HTMLOutput> {
    const file: AsciidocFile = await AsciidocFile.fromString(fileName, fileContent)
    const presentation: Presentation = await this.compiler.parse(file)
    return presentation.render(new HTMLRenderer(), { revealJSAssetsPath })
  }

  public async renderPDF(
    fileName: string,
    fileContent: string,
    revealJSAssetsPath?: string,
  ): Promise<PDFOutput> {
    const file: AsciidocFile = await AsciidocFile.fromString(fileName, fileContent)
    const presentation: Presentation = await this.compiler.parse(file)
    return presentation.render(new PDFRenderer(), { revealJSAssetsPath })
  }

  public async renderImage(
    fileName: string,
    fileContent: string,
    revealJSAssetsPath?: string,
    slideId?: number,
  ): Promise<ImageOutput> {
    const file: AsciidocFile = await AsciidocFile.fromString(fileName, fileContent)
    const presentation: Presentation = await this.compiler.parse(file)
    if (slideId) {
      return presentation.renderSlide(new ImageRenderer(), slideId, { revealJSAssetsPath })
    }
    return presentation.render(new ImageRenderer(), { revealJSAssetsPath })
  }
}
