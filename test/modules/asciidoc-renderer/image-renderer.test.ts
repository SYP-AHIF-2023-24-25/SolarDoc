import {AsciidocCompiler, AsciidocFile, ImageRenderer} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";
import fs from "fs";
import path from "path";

describe("ImageRenderer", () => {
  describe("render()", () => {
    it("should return a image Output", async () => {
      const adocString =
        `= Test\n\nx\n\n== Hello\n\n== test slide 3\n\n=== test slide 4\n\n== test slide 5`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const img = await presentation.render(new ImageRenderer(),{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      let num = 1;
      for(let image of img.internalData){
        const pdfDir = path.dirname(`TestImage${num}.png`);
        try {
          fs.accessSync(pdfDir, fs.constants.F_OK);
        } catch {
          fs.mkdirSync(pdfDir, { recursive: true });
        }
        fs.writeFileSync(`TestImage${num}.png`, image);
        num++;
      }

      assert.notEqual(img.internalData, null, "internalData is empty");

    });
    it("should return a specific image",async ()=>{
      const adocString =
        `= Test\n\nx\n\n== Hello\n\n== test slide 3\n\n=== test slide 4\n\n== test slide 5`;
      const adocFilename = "test.adoc";
      const adocFile = await AsciidocFile.fromString(
        adocFilename,
        adocString,
      );
      const asciidocCompiler = new AsciidocCompiler();
      const presentation = await asciidocCompiler.parse(adocFile);

      const img = await presentation.renderSlide(new ImageRenderer(),1,{revealJSAssetsPath: "https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/"});
      const pdfDir = path.dirname(`TestImageSingle.png`);
      try {
        fs.accessSync(pdfDir, fs.constants.F_OK);
      } catch {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      fs.writeFileSync(`TestImageSingle.png`, img.internalData[0]);
    })
  });
});