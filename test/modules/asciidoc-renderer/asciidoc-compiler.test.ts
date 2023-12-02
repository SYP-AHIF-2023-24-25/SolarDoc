import { assert } from "chai";
import {AsciidocCompiler, AsciidocFile, Presentation} from "@solardoc/asciidoc-renderer";

describe("AsciidocCompiler", () => {
    describe("compile()", () => {
        it("should return presentation", async () => {
            const content = "= Test\n== Still testing";
            const fileName = "test.adoc";
            const testFile: AsciidocFile = await AsciidocFile.fromString(fileName,content);
            const asciidocCompiler = new AsciidocCompiler();
            const metadata  = asciidocCompiler.asciidoctor.load(testFile.content);
            assert.equal(metadata.getSource(), content, "Test file content is not correct");

            const presentation = new Presentation(asciidocCompiler, metadata);
            assert.equal(presentation.parsedFile, metadata , "Presentation is not correct");
            assert.equal(presentation.compiler, asciidocCompiler , "Presentation is not correct");
        });
    });
});