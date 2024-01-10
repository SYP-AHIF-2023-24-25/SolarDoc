import {AsciidocCompiler, AsciidocFile} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";


describe("Presentation", () => {
  describe("constructor()", () => {
    it("should return instance", async () => {
      const content = "= Test\n== Still testing";
      const fileName = "test.adoc";
      const testFile: AsciidocFile = await AsciidocFile.fromString(
        fileName,
        content
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(testFile);
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
        presentation.metadata.title,
        "Test",
        "Presentation 'metadata.title' property is not correct"
      );
    })
  })

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
      assert.equal(presentation.metadata.slideCountInclSubslides, 4);
      assert.equal(presentation.metadata.slideCount, 4);
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
      assert.equal(presentation.metadata.slideCountInclSubslides,5 );
      assert.equal(presentation.metadata.slideCount,4);
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
      assert.equal(presentation.metadata.slideCountInclSubslides,6 );
      assert.equal(presentation.metadata.slideCount,4);
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
      assert.equal(presentation.metadata.slideCountInclSubslides,8 );
      assert.equal(presentation.metadata.slideCount,4);
    });
  });
});
