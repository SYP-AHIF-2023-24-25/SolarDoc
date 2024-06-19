/**
 * This is a slimmed down version of the decktape module.
 *
 * It is based on the decktape module version 3.10.0.
 */
import { PDFDocument } from 'pdf-lib'
import puppeteer from 'puppeteer'
import {
  exportSlide,
  exportSlides,
  getScreenshots,
  getSingleScreenshot,
  nextSlide,
  preparePage,
  preparePlugin,
} from './decktape-utils'
import { PresentationMetadata } from '../../presentation-metadata'

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
   * @param metadata the metadata of the presentation
   * @param slideNum The index of the slide which should be rendered
   * @returns The rendered PDF document.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderRJSHTMLToPDF(
    rjsHTML: string,
    metadata: PresentationMetadata,
    slideNum?: number,
  ): Promise<PDFDocument> {
    const browser = await puppeteer.launch({
      headless: true,
    })
    const page = await preparePage(rjsHTML, browser)
    const plugin = await preparePlugin(page)
    const pdfDocument = await PDFDocument.create()
    const context: any = {
      progressBarOverflow: 0,
      currentSlide: 1,
      exportedSlides: 0,
      pdfFonts: {},
      pdfXObjects: {},
      totalSlides: metadata.slideCountInclSubslides,
    }

    if (slideNum) {
      for (let i = 1; i < slideNum; i++) {
        await nextSlide(plugin, context)
      }
      await exportSlide(page, pdfDocument, context)
    } else {
      await exportSlides(pdfDocument, page, plugin, context)
    }

    await browser.close()
    return PDFDocument.load(await pdfDocument.save())
  }

  /**
   * Renders the given HTML to an image using a headless browser (puppeteer), where the HTML is rendered using
   * the Reveal.js library.
   *
   * This uses the functionality implemented by the decktape module, but in a slimmed down version, which is not
   * CLI-bound.
   * @param rjsHTML The reveal.js HTML that should be rendered.
   * @param format The format of the image that should be rendered.
   * @param metadata The metadata of the reveal.js HTML that should be rendered
   * @param slideNum The index of the slide which should be rendered
   * @returns The rendered image as a buffer.
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  public async renderRJSHTMLToImage(
    rjsHTML: string,
    format: 'png' | 'jpeg',
    metadata: PresentationMetadata,
    slideNum?: number,
  ): Promise<Buffer[]> {
    const browser = await puppeteer.launch({
      headless: true,
    })

    const page = await preparePage(rjsHTML, browser)
    const plugin = await preparePlugin(page)
    const pdfDocument = await PDFDocument.create()
    const context: any = {
      progressBarOverflow: 0,
      currentSlide: 1,
      exportedSlides: 0,
      pdfFonts: {},
      pdfXObjects: {},
      totalSlides: metadata.slideCountInclSubslides,
    }

    if (slideNum) {
      return await getSingleScreenshot(page, plugin, context, format, slideNum)
    }
    return await getScreenshots(page, pdfDocument, plugin, format, metadata, context)
  }
}
