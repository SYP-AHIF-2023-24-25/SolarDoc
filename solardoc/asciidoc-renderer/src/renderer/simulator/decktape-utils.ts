import {decodePDFRawStream, ParseSpeeds, PDFDocument, PDFName} from "pdf-lib";
import crypto from "crypto";
import {Font} from "fonteditor-core";
import {Page} from "puppeteer";
import fs from "fs";
import path from "path";

export async function registerErrorHandler(page:Page) {
  page
    .on('requestfailed', request => {
      // do not output warning for cancelled requests
      if (request.failure() && request.failure().errorText === 'net::ERR_ABORTED') return;
      console.log('\nUnable to load resource from URL: %s', request.url());
    })
    .on('pageerror', error => console.log('\nPage error: %s', error.message));
}

export async function loadAvailablePlugins(pluginsPath: string) {
  const plugins = await fs.promises.readdir(pluginsPath);
  const entries = await Promise.all(plugins.map(async pluginPath => {
    const [, plugin] = pluginPath.match(/^(.*)\.js$/);
    if (plugin && (await fs.promises.stat(path.join(pluginsPath, pluginPath))).isFile()) {
      return [plugin, await import(`./plugins/${pluginPath}`)];
    }
  }));
  return Object.fromEntries(entries.filter(Boolean));
}

export async function renderHTML(page:Page, rjsHTML: string, pdfDocument: PDFDocument,plugins: string[]) {
   await page.setContent(rjsHTML);
   let plugin = await createPlugin(page, plugins);
   await configurePlugin(plugin);
   await page.setViewport({width:1280, height:720});
   await exportSlides(pdfDocument, page, plugin);

}

async function configurePlugin(plugin) {
  if (typeof plugin.configure === 'function') {
    await plugin.configure();
  }
}

async function createPlugin(page: Page, plugins: string[]) {
  let plugin = await createActivePlugin(page, plugins);
   /* if (!plugin) {
      console.log('No supported DeckTape plugin detected, falling back to generic plugin');
      plugin = plugins['generic'].create(page, options);
    }
    plugin = plugins[options.command].create(page, options);*/
    if (!await plugin.isActive()) {
      throw Error(`Unable to activate the ${plugin.getName()} DeckTape plugin`);
    }
  return plugin;
}

async function createActivePlugin(page: Page, plugins: any) {
  for (let id in plugins) {
    if (id === 'generic') continue;
    const plugin = plugins[id].create(page);
    if (await plugin.isActive()) return plugin;
  }
}



async function exportSlides(pdf:PDFDocument, page: Page,plugin: any): Promise<void> {

  const context : any = {
    progressBarOverflow : 0,
    currentSlide        : 1,
    exportedSlides      : 0,
    pdfFonts            : {},
    pdfXObjects         : {},
    totalSlides         : await plugin.slideCount(),
  };
  /*if (options.slides && !options.slides[context.currentSlide]) {
    process.stdout.write('\r no progress bar anymore');
  } else {
    //await pause(options.pause);

  }*/
  await exportSlide(page, pdf, context);

  //const maxSlide = options.slides ? Math.max(...Object.keys(options.slides)) : Infinity;
  let hasNext = await hasNextSlide(plugin, context);
  while (hasNext && context.currentSlide < plugin.slideCount) {
    await nextSlide(plugin, context);
    //await pause(options.pause);
    /*if (options.slides && !options.slides[context.currentSlide]) {
      process.stdout.write('\r No progress bar anymore');
    } else {

    }*/
    await exportSlide(page, pdf, context);
    hasNext = await hasNextSlide(plugin, context);
  }
  // Flush consolidated fonts
  Object.values(context.pdfFonts).forEach(({ ref, font }) => {
    pdf.context.assign(ref, pdf.context.flateStream(font.write({ type: 'ttf', hinting: true })));
  });
  return context;
}

async function exportSlide(page:Page,pdf:PDFDocument, context:any) {
  process.stdout.write('\r no progress bar anymore');

  const buffer = await page.pdf({
    width               : 1280,
    height              : 720,
    printBackground     : true,
    pageRanges          : '1',
    displayHeaderFooter : false,
    //timeout             : options.bufferTimeout,
  });
  await printSlide(pdf, await PDFDocument.load(buffer, { parseSpeed: ParseSpeeds.Fastest }), context);
  context.exportedSlides++;

  /*if (options.screenshots) {
    for (let resolution of options.screenshotSizes || [options.size]) {
      await page.setViewport(resolution);
      // Delay page rendering to wait for the resize event to complete,
      // e.g. for impress.js (may be needed to be configurable)
      //await pause(1000);
      await page.screenshot({
        path: path.join(options.screenshotDirectory, options.filename
          .replace('.pdf', `_${context.currentSlide}_${resolution.width}x${resolution.height}.${options.screenshotFormat}`)),
        fullPage: false,
        omitBackground: true,
      });
      await page.setViewport(options.size);
      //await pause(1000);
    }
  }*/
}

async function printSlide(pdf:PDFDocument, slide:any, context:any) {
  const duplicatedEntries = [];
  const [page] = await pdf.copyPages(slide, [0]);

  pdf.addPage(page);
  // Traverse the page to consolidate duplicates
  parseResources(page.node);
  // And delete all the collected duplicates
  duplicatedEntries.forEach(ref => pdf.context.delete(ref));

  function parseResources(dictionary: any) {
    const resources = dictionary.get(PDFName.Resources);
    if (resources.has(PDFName.XObject)) {
      const xObject = resources.get(PDFName.XObject);
      xObject.entries().forEach((entry: [any, any]) => parseXObject(entry, xObject));
    }
    if (resources.has(PDFName.Font)) {
      resources.get(PDFName.Font).entries().forEach(parseFont);
    }
  }

  function parseXObject([name, entry], xObject: any) {
    const object: any  = page.node.context.lookup(entry);
    const subtype = object.get(PDFName.of('Subtype'));
    if (subtype === PDFName.of('Image')) {
      const digest = crypto.createHash('SHA1').update(object.contents).digest('hex');
      const existing = context.pdfXObjects[digest];
      if (!existing) {
        // Store the entry that'll replace references with the same content
        context.pdfXObjects[digest] = entry;
      } else if (entry !== existing) {
        // Only remove references from different pages
        xObject.set(name, context.pdfXObjects[digest]);
        duplicatedEntries.push(entry);
      }
    } else {
      parseResources(object.dict);
    }
  }
  // eslint-disable-next-line no-unused-vars
  function parseFont([_, entry]) {
    const object:any = page.node.context.lookup(entry);
    const subtype = object.get(PDFName.of('Subtype'));
    if (subtype === PDFName.of('Type0')) {
      const descendant: any = page.node.context.lookup(object.get(PDFName.of('DescendantFonts')).get(0));
      if (descendant.get(PDFName.of('Subtype')) === PDFName.of('CIDFontType2')) {
        const descriptor: any = page.node.context.lookup(descendant.get(PDFName.of('FontDescriptor')));
        const ref = descriptor.get(PDFName.of('FontFile2'));
        const file: any = page.node.context.lookup(ref);
        if (!file) {
          // The font has already been processed and removed
          return;
        }
        const bytes = decodePDFRawStream(file).decode();
        let font;
        try {
          // Some fonts written in the PDF may be ill-formed. Let's skip font compression in that case,
          // until it's fixed in Puppeteer > Chromium > Skia.
          // This happens for system fonts like Helvetica Neue for which cmap table is missing.
          font = Font.create(Buffer.from(bytes), { type: 'ttf', hinting: true });
        } catch (e) {
          console.log('\nSkipping font compression: %s', e.message);
          return;
        }
        // Some fonts happen to miss some metadata and tables required by fonteditor
        if (!font.data.name) {
          font.data.name = {};
        }
        if (!font.data['OS/2']) {
          font.data['OS/2'] = {};
        }
        // PDF font name does not contain sub family on Windows 10,
        // so a more robust key is computed from the font metadata
        const id = descriptor.get(PDFName.of('FontName')).value() + ' - ' + fontMetadataKey(font.data.name);
        if (context.pdfFonts[id]) {
          const f = context.pdfFonts[id].font;
          font.data.glyf.forEach((g, i) => {
            if (g.contours && g.contours.length > 0) {
              if (!f.data.glyf[i] || !f.data.glyf[i].contours || f.data.glyf[i].contours.length === 0) {
                mergeGlyph(f, i, g);
              }
            } else if (g.compound) {
              if (!f.data.glyf[i] || typeof f.data.glyf[i].compound === 'undefined') {
                mergeGlyph(f, i, g);
              }
            }
          });
          descriptor.set(PDFName.of('FontFile2'), context.pdfFonts[id].ref);
          duplicatedEntries.push(ref);
        } else {
          context.pdfFonts[id] = { ref: ref, font: font };
        }
      }
    }
  }

  function mergeGlyph(font, index, glyf) {
    if (font.data.glyf.length <= index) {
      for (let i = font.data.glyf.length; i < index; i++) {
        font.data.glyf.push({ contours: Array(0), advanceWidth: 0, leftSideBearing: 0 });
      }
      font.data.glyf.push(glyf);
    } else {
      font.data.glyf[index] = glyf;
    }
  }

  function fontMetadataKey(font) {
    const keys = ['fontFamily', 'fontSubFamily', 'fullName', 'preferredFamily', 'preferredSubFamily', 'uniqueSubFamily'];
    return Object.entries(font)
      // eslint-disable-next-line no-unused-vars
      .filter(([key, _]) => keys.includes(key))
      .reduce((r, [k, v], i) => r + (i > 0 ? ',' : '') + k + '=' + v, '');
  }
}

async function hasNextSlide(plugin, context) {
  if (typeof plugin.hasNextSlide === 'function') {
    return await plugin.hasNextSlide();
  } else {
    return context.currentSlide < context.totalSlides;
  }
}

async function nextSlide(plugin, context: any){
  context.currentSlide++;
  return plugin.nextSlide();
}

