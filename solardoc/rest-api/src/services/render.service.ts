import { BindingScope, injectable } from '@loopback/core'

// Import render library
import { AsciidocCompiler } from '@solardoc/asciidoc-renderer'

@injectable({ scope: BindingScope.TRANSIENT })
export class RenderService {
  private readonly _compiler: AsciidocCompiler

  constructor() {
    this._compiler = new AsciidocCompiler()
  }

  /**
   * Get the initialised compiler instance.
   * @since 0.2.0
   */
  public get compiler(): AsciidocCompiler {
    return this._compiler
  }
}
