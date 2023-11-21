import browserify from 'browserify';
import * as path from 'path';

const entryFile = path.join(__dirname, '..', 'web', 'web-bundle.ts');
const tsconfig = path.join(__dirname, '..', 'tsconfig.json');

browserify({
  entries: entryFile,
  extension: ['js', 'ts'],
  external: ['@asciidoctor/core', '@asciidoctor/reveal.js'],
  noParse: []
})
  .plugin('tsify', { target: 'es6', project: tsconfig })
  .transform('babelify', { extensions: [ '.ts' ] })
  .bundle()
  .on('error', (error: any) => console.error(error.toString()))
  .on('log', (msg: any) => console.info(msg))
  .pipe(process.stdout)
