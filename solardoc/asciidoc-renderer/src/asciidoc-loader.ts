import type * as AsciidoctorLib from '@asciidoctor/core'
import type AsciidoctorRevealJS from '@asciidoctor/reveal.js'

/**
 * Loads the asciidoctor library and returns the instance of it.
 *
 * This is very bad code, but otherwise it will not work. This is because the library needs to be both node-compatible
 * and web-compatible, which means we have to manually import the library and then define it on the global scope.
 * @since 0.2.0
 */
export function loadAsciidoctor(): AsciidoctorLib.Asciidoctor {
  // Try to determine the global scope
  // @ts-ignore
  // eslint-disable-next-line no-undef
  const globalScope =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : typeof self !== 'undefined'
            ? self
            : {}

  // Try to get the opal runtime and then define it on the global scope
  // @ts-ignore
  // globalScope.Opal = globalScope.Opal || require("opal-runtime").Opal;

  // Load the asciidoctor library
  // @ts-ignore
  globalScope.Asciidoctor =
    globalScope.Asciidoctor || (<typeof AsciidoctorLib>require('@asciidoctor/core'))()

  // Get the reveal.js converter
  globalScope.asciidoctorRevealJS =
    globalScope.asciidoctorRevealJS || <typeof AsciidoctorRevealJS>require('@asciidoctor/reveal.js')
  globalScope.asciidoctorRevealJS.register()

  // Return the asciidoctor instance
  return globalScope.Asciidoctor
}
