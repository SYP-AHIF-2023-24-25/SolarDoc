import { AsciidocCompiler, AsciidocFile, HTMLRenderer } from "@solardoc/asciidoc-renderer";
import { assert } from "chai";

describe("HtmlRenderer", () => {
  describe("render()", () => {
    const adocString =
`= Test\\n\\nx\\n\\n== Still testing\\n\\nMain-Slide 2\\n\\n=== Still testing\\n\\nSub-Slide 2.1\\n\\n== Still testing
\\n\\nx\\n\\n== Still testing\\n\\nx"`;
    const adocFilename = "test.adoc";

    it("should return a reveal.js html string", async () => {
      const adocFile = await AsciidocFile.fromString(
        adocString,
        adocFilename
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.compile(adocFile);

      const html = await presentation.render(new HTMLRenderer());
      assert.notEqual(html.internalData, "", "internalData is empty");
    });
  });
});
