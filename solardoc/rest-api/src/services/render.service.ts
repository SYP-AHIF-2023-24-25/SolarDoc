import {injectable, BindingScope} from '@loopback/core';

// Import render library
import {AsciidocCompiler} from '@solardoc/asciidoc-renderer';

@injectable({scope: BindingScope.TRANSIENT})
export class RenderService {
  private _compiler: AsciidocCompiler;

  constructor() {
    this._compiler = new AsciidocCompiler();
    console.log(this._compiler);
  }
}
