import {AsciidocCompiler, AsciidocFile, DecktapeSlim, HTMLRenderer, PDFRenderer} from "@solardoc/asciidoc-renderer";
import { assert } from "chai";
import path from "path";
import fs from "fs";


describe("DecktapeSlim", () => {
  describe("renderRJSHTMLToPDF()", () => {
    it("should return PDF document", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n== Still testing
\n\nx\n\n== Still testing\n\nx"`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const pdf = await presentation.render(new PDFRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      assert.notEqual(pdf.internalData, null, "internalData is empty");
      const pdfDir = path.dirname("test.pdf");
      try {
        fs.accessSync(pdfDir, fs.constants.F_OK);
      } catch {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      fs.writeFileSync("test.pdf", await pdf.internalData.save({ addDefaultPage: false }));

    });
  });
});