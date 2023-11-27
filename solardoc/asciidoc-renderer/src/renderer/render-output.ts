/**
 * {@link RenderOutput} is the base class for all render outputs. It contains the content of the rendered output.
 * @since 0.2.0
 */
export abstract class RenderOutput<RawT, OutT> {
  protected _content: RawT

  protected constructor(content: RawT) {
    this._content = content

    // TODO!
    throw new Error('Not implemented yet!')
  }

  /**
   * Returns the raw content of the {@link RenderOutput}.
   *
   * This may be a string, a buffer or any other format that is used internally.
   * @since 0.2.0
   */
  get content(): RawT {
    return this._content
  }

  /**
   * Converts the content of the {@link RenderOutput} to a file-writable format.
   * @since 0.2.0
   */
  public abstract write(): Promise<OutT>
}
