import {AsciidocCompiler, AsciidocFile} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";


describe("Presentation", () => {
  describe("getDocumentMetadata()", () => {
    it("should return proper metadata for document without sub-slides", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n== Still testing\n\nx\n\n== Still testing\n\nx"`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCount, 4);
      assert.equal(presentation.metadata.mainSlideCount, 4);
    });

    it("should return proper metadata for document with a sub-slide", async () => {
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
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCount,5 );
      assert.equal(presentation.metadata.mainSlideCount,4);
    });

    it("should return proper metadata for document with multiple sub-slides in a slide", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n=== Still testing Sub-Slide 2.2\n\n== Still testing
\n\nx\n\n== Still testing\n\nx"`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCount,6 );
      assert.equal(presentation.metadata.mainSlideCount,4);
    });

    it("should return proper metadata for document with multiple sub-slides in multiple slides and paragraphs", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\nx\n\nanother paragraph\n\n=== Still testing\n\nSub-Slide 2.1\n\n=== Still testing\n\n Sub-Slide 2.2\n\n== Still testing\n\nMain Slide-3\n\n=== Still testing Sub-Slide 3.1\n\n=== Still testing Sub-Slide 3.2\n\n== Still testing\n\n Main Slide-4\n\n"`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCount,8 );
      assert.equal(presentation.metadata.mainSlideCount,4);

    });
  });

});