import {AsciidocCompiler, AsciidocFile} from "@solardoc/asciidoc-renderer";
import {PDFRenderer} from "@solardoc/asciidoc-renderer/dist/renderer/targets/pdf";
import {assert} from "chai";

describe("PDFRenderer", () => {
  describe("NodePDFRenderer", () => {
    describe("render()", () => {
      const adocString =
        `= Test\\n\\nx\\n\\n== Still testing\\n\\nMain-Slide 2\\n\\n=== Still testing\\n\\nSub-Slide 2.1\\n\\n== Still testing
\\n\\nx\\n\\n== Still testing\\n\\nx"`;
      const adocFilename = "test.adoc";

      // TODO! Implement proper PDFRenderer tests once the PDFRenderer is implemented
      // it("should return a PDFOutput", async () => {
      //   const adocFile = await AsciidocFile.fromString(
      //     adocString,
      //     adocFilename
      //   );
      //   const asciidocCompiler = new AsciidocCompiler();
      //   const presentation = await asciidocCompiler.compile(adocFile);
      //
      //   const html = await presentation.render(new PDFRenderer());
      //   assert.notEqual(html.internalData, "", "internalData is empty");
      // });
    });
  })
});
