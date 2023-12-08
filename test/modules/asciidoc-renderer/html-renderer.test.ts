import { AsciidocCompiler, AsciidocFile } from "@solardoc/asciidoc-renderer";
import { HTMLRenderer } from "@solardoc/asciidoc-renderer/dist/renderer/targets/html";
import * as fs from "fs";
import { assert } from "chai";

describe("HtmlRenderer", () => {
  describe("render()", () => {
    it("should return a reveal.js html string", async () => {
      const adocFile = await AsciidocFile.fromString(
        "test.adoc",
        "= Test\n== Still testing"
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.compile(adocFile);

      const html = await presentation.render(new HTMLRenderer());
      assert.equal(html.internalData, "", "HTML is not correct");
    });
  });
});
