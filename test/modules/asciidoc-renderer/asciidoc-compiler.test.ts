import { assert } from "chai";
import {AsciidocFile} from "@solardoc/asciidoc-renderer";

describe("Test asciidoc-compiler", () => {
    describe("Test compile function", () => {
        it("should convert an adoc file to reveal.js html", () => {
            const testFile: AsciidocFile = AsciidocFile.fromString("test","= Test\n== Still testing");
        });
    });
});