import { assert } from "chai";
import {
  AsciidocCompiler,
  AsciidocFile,
  Presentation,
} from "@solardoc/asciidoc-renderer";

describe("AsciidocCompiler", () => {
  describe("parse()", () => {
    it("should return presentation", async () => {
      const content = "= Test\n== Still testing";
      const fileName = "test.adoc";
      const testFile: AsciidocFile = await AsciidocFile.fromString(
        fileName,
        content
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation: Presentation = await asciidocCompiler.parse(testFile);
      assert.equal(
        presentation.parsedFile.getSource(),
        testFile.content,
        "Presentation 'parsedFile' should equal parsedFile is not correct"
      );
      assert.equal(
        presentation.compiler,
        asciidocCompiler,
        "Presentation 'compiler' property is not correct"
      );
      assert.equal(
        presentation.compiler.asciidoctor,
        asciidocCompiler.asciidoctor,
        "Presentation 'asciidoctor' property is not correct"
      )
      assert.equal(
        presentation.metadata.title,
        "Test",
        "Presentation 'metadata.title' property is not correct"
      );
    });
  });
});
