import { TargetRenderer } from '../target-renderer'
import { HTMLOutput } from './html-output'
import { Presentation } from '../../../presentation'
import { Slide } from '../../../slide'
import { Asciidoctor } from '@asciidoctor/core'
import { InternalError } from '../../../errors'
import { AsciidocCompiler } from '../../asciidoc-compiler'
import { HTMLRendererConfig } from './html-renderer-config'

export type HTMLString = string

/**
 * Renders a presentation or slide to an image file.
 * @since 0.2.0
 */
export class HTMLRenderer extends TargetRenderer<HTMLString, HTMLString> {
  private static readonly renderOptions = {
    ...AsciidocCompiler.parseOptions,
    /**
     * Standalone hints to the processor that the document requires a full document render.
     *
     * This is to ensure it doesn't just return an empty string when rendering a full document.
     * @since 0.2.0
     */
    standalone: true,
  } satisfies Asciidoctor.ProcessorOptions

  private static readonly DEFAULT_REVEAL_JS_DEPENDENCY_PATH = 'node_modules/reveal.js'

  public constructor() {
    super()
  }

  /**
   * Renders the given {@link Presentation presentation} to a reveal.js HTML presentation.
   * @param presentation The presentation that should be rendered.
   * @param config The configuration for the HTML renderer.
   * @since 0.2.0
   */
  public async render(
    presentation: Presentation,
    config?: HTMLRendererConfig,
  ): Promise<HTMLOutput> {
    let htmlOutput = presentation.parsedFile.convert(HTMLRenderer.renderOptions)
    if (typeof htmlOutput !== 'string') {
      throw new InternalError(
        `HTML output is not a string! Potential bug in asciidoctor.js! (Input: ${presentation.sourceCode})`,
      )
    }

    // Replace the reveal.js dependency path if needed
    if (config?.revealJSAssetsPath) {
      config.revealJSAssetsPath = config.revealJSAssetsPath.replace(/\/$/, '')

      // Replace the dependency path in the head for any resources that uses it i.e. style sheets and scripts
      htmlOutput = htmlOutput.replace(
        new RegExp(`(src|href)="(${HTMLRenderer.DEFAULT_REVEAL_JS_DEPENDENCY_PATH}/)([^"]+)"`, 'g'),
        `$1="${config.revealJSAssetsPath}/$3"`,
      )

      // Replace all dependency paths within "src: '...'" code (Both ' and " are supported, must be inside a script tag)
      htmlOutput = htmlOutput.replace(
        new RegExp(
          `src: (['"])(${HTMLRenderer.DEFAULT_REVEAL_JS_DEPENDENCY_PATH}/)([^'"]+)(['"])`,
          'g',
        ),
        `src: $1${config.revealJSAssetsPath}/$3$4`,
      )
    }

    return new HTMLOutput(htmlOutput, presentation)
  }

  /**
   * Renders a single {@link Slide slide} of the presentation to a reveal.js HTML slide (one-slide presentation).
   *
   * IMPORTANT! This may not be needed, but for completeness, it is here. Whether it's actually implemented or not
   * will be decided later.
   * @param presentation The presentation that should be rendered.
   * @param slide The slide that should be rendered. (Index or {@link Slide})
   * @param config The configuration for the HTML renderer.
   * @since 0.2.0
   */
  public renderSlide(
    presentation: Presentation,
    slide: number | Slide,
    config?: { [key: string]: any },
  ): Promise<HTMLOutput> {
    // TODO!
    throw new Error('Not implemented yet!')
  }
}
