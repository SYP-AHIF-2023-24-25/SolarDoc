import {AsciidocCompiler, AsciidocFile, DecktapeSlim, HTMLRenderer, PDFRenderer} from "@solardoc/asciidoc-renderer";
import { assert } from "chai";
import path from "path";
import fs from "fs";


describe("PdfRenderer", () => {
  describe("render()", () => {
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
      const filepath = path.join(__dirname, "TestPDFMultipleSlides.pdf");
      fs.writeFileSync(filepath, await pdf.write());
    });
  });
  describe("renderSlide()", ()=>{
    it("Should return PDF with a specific slide", async ()=>{
      const adocString =
        `= Test\n\nx\n\n== Slide 2\n\nMain-Slide 2\n\n=== Slide 3\n\nSub-Slide 2.1\n\n== Slide 4
\n\nMain-Slide 3\n\n== Still testing\n\nMain-Slide 4`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const pdf = await presentation.renderSlide(new PDFRenderer(),3,{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      assert.notEqual(pdf.internalData, null, "internalData is empty");
      assert.equal(pdf.internalData.getPages().length, 1, "PDF document should have 1 page");
      const filepath = path.join(__dirname, "TestPDFSpecific.pdf");
      fs.writeFileSync(filepath, await pdf.write());
    })
  })
});
