import {AsciidocFile} from "@solardoc/asciidoc-renderer";
import {assert} from "chai";

describe("AsciidocFile", () => {
    describe("fromString()", () => {
        it("should return instance", async () => {
            const content = "= Test\n== Still testing";
            const fileName = "test.adoc";
            const testFile: AsciidocFile = await AsciidocFile.fromString(fileName,content);
            assert.equal(testFile.content,content, "Test file content is not correct");
            assert.equal(testFile.fileName,fileName, "Test file name is not correct");
        });
    });
});