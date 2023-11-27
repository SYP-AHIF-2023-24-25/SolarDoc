/**
 * The standalone web-module for the Solardoc Asciidoc Renderer.
 * @author Luna Klatzer, Emma Walchshofer & Lisa Pichler
 * @copyright 2023 Luna Klatzer, Emma Walchshofer & Lisa Pichler
 * @since 0.10.0
 */
import * as AsciidocRenderer from "@solardoc/asciidoc-renderer";

// Try to determine the global scope
// @ts-ignore
// eslint-disable-next-line no-undef
const globalScope = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};

// @ts-ignore
globalScope.AsciidocRenderer = globalScope.AsciidocRenderer || AsciidocRenderer;

// Validating integrity of the module
(() => {
  console.log(`Starting 'AsciidocCompiler' module integrity check...`);
  const compiler = new AsciidocRenderer.AsciidocCompiler();
  console.log(`Asciidoctor Compiler: ${compiler?.asciidoctor?.getVersion()}`);
})();
