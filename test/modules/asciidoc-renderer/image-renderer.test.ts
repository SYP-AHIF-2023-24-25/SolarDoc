import {AsciidocCompiler, AsciidocFile, ImageRenderer} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";
import fs from "fs";
import path from "path";

describe("ImageRenderer", () => {
  describe("render()", () => {
    it("should return a image Output", async () => {
      const adocString =
        `= Test\n\nx\n\n"`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const img = await presentation.render(new ImageRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      const pdfDir = path.dirname("TestImage.png");
      try {
        fs.accessSync(pdfDir, fs.constants.F_OK);
      } catch {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      fs.writeFileSync("TestImage.png", img.internalData);
      assert.notEqual(img.internalData, null, "internalData is empty");

    });
  });
});