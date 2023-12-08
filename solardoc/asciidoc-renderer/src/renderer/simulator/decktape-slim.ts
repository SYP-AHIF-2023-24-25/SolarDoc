/**
 * This is a slimmed down version of the decktape module.
 *
 * It is based on the decktape module version 3.10.0.
 */
import {PDFDocument} from "pdf-lib";

/**
 * This is a slimmed down version of the decktape module, which is not CLI-bound.
 *
 * This is used to generate both PDFs and images from reveal.js HTML files.
 * @since 0.2.0
 */
export class DecktapeSlim {
  /**
   * Renders the given HTML to a PDF document using a headless browser (puppeteer), where the HTML is rendered using
   * the Reveal.js library.
   *
   * This uses the functionality implemented by the decktape module, but in a slimmed down version, which is not
   * CLI-bound.
   * @param rjsHTML The reveal.js HTML that should be rendered.
   * @returns The rendered PDF document.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderRJSHTMLToPDF(rjsHTML: string): Promise<PDFDocument> {
    throw new Error('Not implemented yet!')
  }


  /**
   * Renders the given HTML to an image using a headless browser (puppeteer), where the HTML is rendered using
   * the Reveal.js library.
   *
   * This uses the functionality implemented by the decktape module, but in a slimmed down version, which is not
   * CLI-bound.
   * @param rjsHTML The reveal.js HTML that should be rendered.
   * @param format The format of the image that should be rendered.
   * @returns The rendered image as a buffer.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderRJSHTMLToImage(rjsHTML: string, format: "png" | "jpg"): Promise<Buffer> {
    throw new Error('Not implemented yet!')
  }
}
