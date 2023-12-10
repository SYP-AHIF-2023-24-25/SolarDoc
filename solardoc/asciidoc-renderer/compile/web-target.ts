import browserify from 'browserify';
import * as path from 'path';
import * as fs from "fs";

const entryFile = path.join(__dirname, '..', 'web', 'web-bundle.ts');
const tsconfig = path.join(__dirname, '..', 'tsconfig.json');
const outputDir = path.join(__dirname, '..', 'dist', 'web');
const outputFile = path.join(outputDir, 'solardoc-ascii-renderer.js');

/**
 * Ensures that the output directory exists.
 * @since 0.2.0
 */
function ensureOutputDirExists(): void {
  fs.mkdir(
    outputDir,
    { recursive: true },
    (err) => {
      if (err) throw err;
    }
  );
}

ensureOutputDirExists();
browserify({
  entries: entryFile,
  extension: ['js', 'ts'],
  external: ['@asciidoctor/core', '@asciidoctor/reveal.js', 'decktape'],
  noParse: []
})
  .plugin('tsify', { target: 'es6', project: tsconfig })
  .transform('browserify-shim', { global: true })
  .transform('babelify', { extensions: [ '.ts' ] })
  .bundle()
  .on('error', (error: any) => console.error(error.toString()))
  .on('log', (msg: any) => console.info(msg))
  .pipe(fs.createWriteStream(outputFile))
