import { AsciidocCompiler, AsciidocFile } from "@solardoc/asciidoc-renderer";
import { HTMLRenderer } from "@solardoc/asciidoc-renderer/dist/renderer/targets/html";
import * as fs from "fs";
import { assert } from "chai";

describe("HtmlRenderer", () => {
  describe("render()", () => {
    it("should return a reveal.js html string", async () => {
      const adocFile = await AsciidocFile.fromString(
        "test.adoc",
        "= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n== Still testing\n\nx\n\n== Still testing\n\nx"
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.compile(adocFile);

      const html = await presentation.render(new HTMLRenderer());
      assert.notEqual(html.internalData, "", "internalData is empty");
    });
  });
});
