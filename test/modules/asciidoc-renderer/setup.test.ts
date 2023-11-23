import type * as asciidocRenderer from "@solardoc/asciidoc-renderer";
import { assert } from "chai";

describe("Setup & Load testing", () => {
  describe("Import module", () => {
    it("should import without errors", () => {
      assert.doesNotThrow(
        () => require("@solardoc/asciidoc-renderer"),
        "Expected module to load without errors"
      );
    });

    describe("should be accessible", () => {
      const module: typeof asciidocRenderer = require("@solardoc/asciidoc-renderer");

      it("should be an object", () => {
        assert.isObject(module, "Expected module to be an object");
      });

      it("should have a constructable 'AsciidocCompiler' class", () => {
        assert.property(
          module,
          "AsciidocCompiler",
          "Expected module to have a 'AsciidocCompiler' property"
        );

        try {
          new module.AsciidocCompiler();
        } catch (e) {
          throw new Error(`Expected 'AsciidocCompiler' to be constructable without errors (Cause: ${e})`);
        }
      });
    });
  });
});
