import {AsciidocCompiler, AsciidocFile, ImageRenderer} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";

describe("ImageRenderer", () => {
  describe("render()", () => {
    it("should return a image Output", async () => {
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

      const img = await presentation.render(new ImageRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      assert.notEqual(img.internalData, null, "internalData is empty");

    });
  });
});