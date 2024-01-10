import { AsciidocFile } from "@solardoc/asciidoc-renderer";
import { assert } from "chai";

type FileFormat = Parameters<typeof AsciidocFile.prototype.getFileSize>[0];

function calcSize(input: number, format: FileFormat): number {
  switch (format) {
    case 'B':
      return input;
    case 'KB':
      return input / 1024;
    case 'MB':
      return input / 1024 / 1024;
    case 'GB':
      return input / 1024 / 1024 / 1024;
    case 'TB':
      return input / 1024 / 1024 / 1024 / 1024;
    case 'PB':
      return input / 1024 / 1024 / 1024 / 1024 / 1024;
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

describe("AsciidocFile", () => {
  describe("fromString()", () => {
    it("should return instance", async () => {
      const content = "= Test\n== Still testing";
      const fileName = "test.adoc";
      const testFile: AsciidocFile = await AsciidocFile.fromString(
        fileName,
        content
      );
      assert.equal(
        testFile.content,
        content,
        "Test file content is not correct"
      );
      assert.equal(
        testFile.fileName,
        fileName,
        "Test file name is not correct"
      );
    });
  });

  describe("fileSize", () => {
    it("should return the correct byte size of ASCII input string", async () => {
      const content = "= NEVER GONNA GIVE YOU UP NEVER GONNA LET YOU DOWN!!";
      const fileName = "test.adoc";
      const testFile: AsciidocFile = await AsciidocFile.fromString(
        fileName,
        content
      );
      assert.equal(
        testFile.fileSize,
        52,
        "Test file size is not correct"
      );
    });

    it("should return the correct byte size of UTF-8 input string", async () => {
      const content = "= NEVER GONNA GIVE YOU UP NEVER GONNA LET YOU DOWN!! 🎵🎵🎵";
      const fileName = "test.adoc";
      const testFile: AsciidocFile = await AsciidocFile.fromString(
        fileName,
        content
      );
      assert.equal(
        testFile.fileSize,
        65,
        "Test file size is not correct"
      );
    });
  });

  describe("getFileSize()", () => {
    ['B', 'KB', 'MB', 'GB', 'TB', 'PB'].forEach((format: string) => {
      describe(`format: '${format}'`, () => {
        it("should return the correct byte size of ASCII input string", async () => {
          const content = "= NEVER GONNA GIVE YOU UP NEVER GONNA LET YOU DOWN!!";
          const fileName = "test.adoc";
          const testFile: AsciidocFile = await AsciidocFile.fromString(
            fileName,
            content
          );

          assert.equal(
            testFile.getFileSize(format as FileFormat),
            calcSize(52, format as FileFormat),
            "Test file size is not correct"
          );
        });

        it("should return the correct byte size of UTF-8 input string", async () => {
          const content = "= NEVER GONNA GIVE YOU UP NEVER GONNA LET YOU DOWN!! 🎵🎵🎵";
          const fileName = "test.adoc";
          const testFile: AsciidocFile = await AsciidocFile.fromString(
            fileName,
            content
          );
          assert.equal(
            testFile.getFileSize(format as FileFormat),
            calcSize(65, format as FileFormat),
            "Test file size is not correct"
          );
        });
      });
    });
  });
});
