import {AsciidocCompiler, AsciidocFile, DEFAULT_PRESENTATION_TITLE} from "@solardoc/asciidoc-renderer";
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
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n== Still testing\n\nx\n\n== Still testing\n\nx`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 4);
      assert.equal(presentation.metadata.slideCount, 4);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 0, 0, 0]);
    });

    it("should return proper metadata for document with a sub-slide", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n== Still testing
\n\nx\n\n== Still testing\n\nx`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 5);
      assert.equal(presentation.metadata.slideCount, 4);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 1, 0, 0]);
    });

    it("should return proper metadata for document with multiple sub-slides in a slide", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n=== Still testing Sub-Slide 2.2\n\n== Still testing
\n\nx\n\n== Still testing\n\nx`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 6);
      assert.equal(presentation.metadata.slideCount, 4);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 2, 0, 0]);
    });

    it("should return proper metadata for document with multiple sub-slides in multiple slides and paragraphs", async () => {
      const adocString =
        `= Test\n\nx\n\n== Still testing\n\nMain-Slide 2\n\nx\n\nanother paragraph\n\n=== Still testing\n\nSub-Slide 2.1\n\n=== Still testing\n\n Sub-Slide 2.2\n\n== Still testing\n\nMain Slide-3\n\n=== Still testing Sub-Slide 3.1\n\nx\n\n=== Still testing Sub-Slide 3.2\n\nx\n\n== Still testing\n\n Main Slide-4\n\n`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 8);
      assert.equal(presentation.metadata.slideCount, 4);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 2, 2, 0]);
    });

    it("should return proper metadata when the first slide is empty and there are multiple slides & sub-slides", async () => {
      const adocString =
        `= Test\n\n== Still testing\n\nMain-Slide 2\n\n=== Still testing\n\nSub-Slide 2.1\n\n=== Still testing Sub-Slide 2.2\n\n== Still testing\n\nMain Slide-3\n\n=== Still testing Sub-Slide 3.1\n\nx\n\n=== Still testing Sub-Slide 3.2\n\nx\n\n== Still testing\n\n Main Slide-4\n\n`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 8);
      assert.equal(presentation.metadata.slideCount, 4);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 2, 2, 0]);
    });

    it("should return proper metadata when the first slide is present but is the only slide", async () => {
      const adocString = `= Test\n\n== Test\nx\n`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isFalse(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, "Test");
      assert.equal(presentation.metadata.slideCountInclSubslides, 2);
      assert.equal(presentation.metadata.slideCount, 2);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0, 0]);
    });

    it("should return proper metadata when there is only text with no headers to indicate slides", async () => {
      const adocString = `Test`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);
      assert.isTrue(presentation.metadata.defaultTitle);
      assert.equal(presentation.metadata.title, DEFAULT_PRESENTATION_TITLE);
      assert.equal(presentation.metadata.slideCountInclSubslides, 1);
      assert.equal(presentation.metadata.slideCount, 1);
      assert.deepEqual(presentation.metadata.subslideCountPerSlide, [0]);
    });
  });
});
