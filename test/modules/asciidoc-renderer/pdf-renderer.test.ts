import {AsciidocCompiler, AsciidocFile, DecktapeSlim, HTMLRenderer, PDFRenderer} from "@solardoc/asciidoc-renderer";
import { assert } from "chai";
import path from "path";
import fs from "fs";


describe("PdfRenderer", () => {
  describe("render()", () => {
    it("should return PDF document with only one page", async () => {
        const adocString = "= Test\n\nx\n\n";
        const adocFilename = "test.adoc";
        const adocFile = await AsciidocFile.fromString(
          adocFilename,
          adocString,
        );
        const asciidocCompiler = new AsciidocCompiler();
        const presentation = await asciidocCompiler.parse(adocFile);
        const pdf = await presentation.render(new PDFRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
        assert.notEqual(pdf.internalData, null, "internalData is empty");
        assert.equal(pdf.internalData.getPages().length, 1, "PDF document should have 1 page");
        const pdfDir = path.dirname("TestOneSlide.pdf");
        try {
          fs.accessSync(pdfDir, fs.constants.F_OK);
        } catch {
          fs.mkdirSync(pdfDir, { recursive: true });
        }
        fs.writeFileSync("TestOneSlide.pdf", await pdf.internalData.save({ addDefaultPage: false }));

    });

    it("should return PDF document with multiple pages", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n== Still testing
\n\nMain-Slide 3\n\n== Still testing\n\nMain-Slide 4`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const pdf = await presentation.render(new PDFRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      assert.notEqual(pdf.internalData, null, "internalData is empty");
      assert.equal(pdf.internalData.getPages().length, 5, "PDF document should have 5 pages");
      const pdfDir = path.dirname("TestMultipleSlides.pdf");
      try {
        fs.accessSync(pdfDir, fs.constants.F_OK);
      } catch {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      fs.writeFileSync("TestMultipleSlides.pdf", await pdf.internalData.save({ addDefaultPage: false }));
    });
  });
});
