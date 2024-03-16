import { decodePDFRawStream, ParseSpeeds, PDFDocument, PDFName } from 'pdf-lib'
import crypto from 'crypto'
import { Font } from 'fonteditor-core'
import { Browser, Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { PresentationMetadata } from '../../presentation-metadata'

export async function registerErrorHandler(page: Page) {
  page
    .on('requestfailed', request => {
      if (request.failure() && request.failure().errorText === 'net::ERR_ABORTED') return
      console.log('\nUnable to load resource from URL: %s', request.url())
    })
    .on('pageerror', error => console.log('\nPage error: %s', error.message))
}

export async function loadAvailablePlugins(pluginsPath: string) {
  const plugins = (await fs.promises.readdir(pluginsPath)).filter((pluginPath: string) =>
    pluginPath.endsWith('.js'),
  )
  const entries = await Promise.all(
    plugins.map(async pluginPath => {
      const [, plugin] = pluginPath.match(/^(.*)\.js$/)
      if (plugin && (await fs.promises.stat(path.join(pluginsPath, pluginPath))).isFile()) {
        /* istanbul ignore next */
        return [plugin, await import(`./plugins/${pluginPath}`)]
      }
    }),
  )
  return Object.fromEntries(entries.filter(Boolean))
}

export async function createPlugin(page: Page, plugins: string[]) {
  let plugin = await createActivePlugin(page, plugins)
  if (!(await plugin.isActive())) {
    throw Error(`Unable to activate the ${plugin.getName()} DeckTape plugin`)
  }
  return plugin
}

async function createActivePlugin(page: Page, plugins: any) {
  for (let id in plugins) {
    if (id === 'generic') continue
    const plugin = plugins[id].create(page)
    if (await plugin.isActive()) return plugin
  }
}

export async function exportSlides(
  pdf: PDFDocument,
  page: Page,
  plugin: any,
  context: any,
): Promise<void> {
  await exportSlide(page, pdf, context)

  while (context.currentSlide < context.totalSlides) {
    await nextSlide(plugin, context)
    await exportSlide(page, pdf, context)
  }
  // Flush consolidated fonts
  Object.values(context.pdfFonts).forEach(({ ref, font }) => {
    pdf.context.assign(ref, pdf.context.flateStream(font.write({ type: 'ttf', hinting: true })))
  })
  return context
}

export async function exportSlide(page: Page, pdf: PDFDocument, context: any) {
  const buffer = await page.pdf({
    width: 1280,
    height: 720,
    printBackground: true,
    pageRanges: '1',
    displayHeaderFooter: false,
  })
  await printSlide(
    pdf,
    await PDFDocument.load(buffer, { parseSpeed: ParseSpeeds.Fastest }),
    context,
  )
  context.exportedSlides++
}

async function printSlide(pdf: PDFDocument, slide: any, context: any) {
  const duplicatedEntries = []
  const [page] = await pdf.copyPages(slide, [0])

  pdf.addPage(page)
  // Traverse the page to consolidate duplicates
  parseResources(page.node)
  // And delete all the collected duplicates
  duplicatedEntries.forEach(ref => pdf.context.delete(ref))

  function parseResources(dictionary: any) {
    const resources = dictionary.get(PDFName.Resources)
    if (resources.has(PDFName.XObject)) {
      const xObject = resources.get(PDFName.XObject)
      xObject.entries().forEach((entry: [any, any]) => parseXObject(entry, xObject))
    }
    if (resources.has(PDFName.Font)) {
      resources.get(PDFName.Font).entries().forEach(parseFont)
    }
  }

  function parseXObject([name, entry], xObject: any) {
    const object: any = page.node.context.lookup(entry)
    const subtype = object.get(PDFName.of('Subtype'))
    if (subtype === PDFName.of('Image')) {
      const digest = crypto.createHash('SHA1').update(object.contents).digest('hex')
      const existing = context.pdfXObjects[digest]
      if (!existing) {
        // Store the entry that'll replace references with the same content
        context.pdfXObjects[digest] = entry
      } else if (entry !== existing) {
        // Only remove references from different pages
        xObject.set(name, context.pdfXObjects[digest])
        duplicatedEntries.push(entry)
      }
    } else {
      parseResources(object.dict)
    }
  }
  // eslint-disable-next-line no-unused-vars
  function parseFont([_, entry]) {
    const object: any = page.node.context.lookup(entry)
    const subtype = object.get(PDFName.of('Subtype'))
    if (subtype === PDFName.of('Type0')) {
      const descendant: any = page.node.context.lookup(
        object.get(PDFName.of('DescendantFonts')).get(0),
      )
      if (descendant.get(PDFName.of('Subtype')) === PDFName.of('CIDFontType2')) {
        const descriptor: any = page.node.context.lookup(
          descendant.get(PDFName.of('FontDescriptor')),
        )
        const ref = descriptor.get(PDFName.of('FontFile2'))
        const file: any = page.node.context.lookup(ref)
        if (!file) {
          // The font has already been processed and removed
          return
        }
        const bytes = decodePDFRawStream(file).decode()
        let font
        try {
          // Some fonts written in the PDF may be ill-formed. Let's skip font compression in that case,
          // until it's fixed in Puppeteer > Chromium > Skia.
          // This happens for system fonts like Helvetica Neue for which cmap table is missing.
          font = Font.create(Buffer.from(bytes), { type: 'ttf', hinting: true })
        } catch (e) {
          console.log('\nSkipping font compression: %s', e.message)
          return
        }
        // Some fonts happen to miss some metadata and tables required by fonteditor
        if (!font.data.name) {
          font.data.name = {}
        }
        if (!font.data['OS/2']) {
          font.data['OS/2'] = {}
        }
        // PDF font name does not contain sub family on Windows 10,
        // so a more robust key is computed from the font metadata
        const id =
          descriptor.get(PDFName.of('FontName')).value() + ' - ' + fontMetadataKey(font.data.name)
        if (context.pdfFonts[id]) {
          const f = context.pdfFonts[id].font
          font.data.glyf.forEach((g, i) => {
            if (g.contours && g.contours.length > 0) {
              if (
                !f.data.glyf[i] ||
                !f.data.glyf[i].contours ||
                f.data.glyf[i].contours.length === 0
              ) {
                mergeGlyph(f, i, g)
              }
            } else if (g.compound) {
              if (!f.data.glyf[i] || typeof f.data.glyf[i].compound === 'undefined') {
                mergeGlyph(f, i, g)
              }
            }
          })
          descriptor.set(PDFName.of('FontFile2'), context.pdfFonts[id].ref)
          duplicatedEntries.push(ref)
        } else {
          context.pdfFonts[id] = { ref: ref, font: font }
        }
      }
    }
  }

  function mergeGlyph(font, index, glyf) {
    if (font.data.glyf.length <= index) {
      for (let i = font.data.glyf.length; i < index; i++) {
        font.data.glyf.push({ contours: Array(0), advanceWidth: 0, leftSideBearing: 0 })
      }
      font.data.glyf.push(glyf)
    } else {
      font.data.glyf[index] = glyf
    }
  }

  function fontMetadataKey(font) {
    const keys = [
      'fontFamily',
      'fontSubFamily',
      'fullName',
      'preferredFamily',
      'preferredSubFamily',
      'uniqueSubFamily',
    ]
    return (
      Object.entries(font)
        // eslint-disable-next-line no-unused-vars
        .filter(([key, _]) => keys.includes(key))
        .reduce((r, [k, v], i) => r + (i > 0 ? ',' : '') + k + '=' + v, '')
    )
  }
}

export async function getScreenshots(
  page: Page,
  pdf: PDFDocument,
  plugin: any,
  format: 'png' | 'jpeg',
  metadata: PresentationMetadata,
  context: any,
): Promise<Buffer[]> {
  let screenshots: Buffer[] = []
  for (let i = 0; i < metadata.slideCountInclSubslides; i++) {
    await exportSlide(page, pdf, context)

    await pause(200)
    let screenshot = await page.screenshot({
      fullPage: false,
      omitBackground: true,
      encoding: 'binary',
      type: format,
    })
    screenshots.push(screenshot)
    await nextSlide(plugin, context)
  }

  return screenshots
}

async function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function nextSlide(plugin, context) {
  context.currentSlide++
  return plugin.nextSlide()
}

export async function preparePage(rjsHTML: string, browser: Browser): Promise<Page> {
  const page = await browser.newPage()
  await page.emulateMediaType('screen')
  await registerErrorHandler(page)
  await page.setContent(rjsHTML)
  await page.setViewport({ width: 1280, height: 720 })
  return page
}

export async function preparePlugin(page: Page) {
  const plugins = await loadAvailablePlugins(path.join(__dirname, 'plugins'))
  let plugin = await createPlugin(page, plugins)

  if (typeof plugin.configure === 'function') {
    await plugin.configure()
  }

  return plugin
}

export async function getSingleScreenshot(
  page: Page,
  plugin: any,
  context: any,
  format: 'png' | 'jpeg',
  slideNum: number,
) {
  for (let i = 1; i < slideNum; i++) {
    await nextSlide(plugin, context)
  }

  let screenshots: Buffer[] = []

  let screenshot = await page.screenshot({
    fullPage: false,
    omitBackground: true,
    encoding: 'binary',
    type: format,
  })

  screenshots.push(screenshot)
  return screenshots
}
