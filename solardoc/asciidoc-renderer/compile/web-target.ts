import * as browserify from 'browserify';
import * as path from 'path';

const entryFile = path.join(__dirname, '..', 'web', 'web-bundle.ts');

browserify({
  entries: entryFile,
  extension: ['js', 'ts', 'tsx'],
  external: ['angular', 'jquery', 'lodash', 'moment', 'react', 'react-dom', 'rx'],
  noParse: []
})
  .plugin('tsify')
  .transform('browserify-shim', {
    global: true
  })
  .bundle()
  .on('error', error => console.error(error.toString()))
  .on('log', msg => console.info(msg))
  .pipe(process.stdout)
