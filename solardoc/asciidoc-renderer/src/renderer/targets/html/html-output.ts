import type { HTMLString } from './html-renderer'
import { RenderOutput } from '../../render-output'
import { Presentation } from '../../../presentation'

/**
 * Wrapper class for an HTML output.
 * @since 0.2.0
 */
export class HTMLOutput extends RenderOutput<HTMLString, HTMLString> {
  public constructor(internalData: string, source: Presentation) {
    super(internalData, source)
  }

  public get extension(): string {
    return 'html'
  }

  /**
   * Converts the content to a file-writable HTML format.
   *
   * In this case the {@link HTMLOutput.internalData internalData} is returned, as it already
   * in the correct format.
   * @since 0.2.0
   */
  public async write(): Promise<HTMLString> {
    return this.internalData
  }
}
