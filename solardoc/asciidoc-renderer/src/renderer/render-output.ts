import {AsciidocFile} from "./asciidoc-file";
import {Presentation} from "../presentation";

/**
 * {@link RenderOutput} is the base class for all render outputs. It contains the content of the rendered output.
 * @since 0.2.0
 */
export abstract class RenderOutput<RawT, OutT> {
  protected _internalData: RawT
  protected _presentation: Presentation

  protected constructor(
    internalData: RawT,
    presentation: Presentation,
  ) {
    this._internalData = internalData
    this._presentation = presentation
  }

  /**
   * Returns the raw content of the {@link RenderOutput}.
   *
   * This may be a string, a buffer or any other format that is used internally.
   * @since 0.2.0
   */
  public get internalData(): RawT {
    return this._internalData
  }

  /**
   * Returns the {@link Presentation} that this {@link RenderOutput} was generated from.
   * @since 0.2.0
   */
  public get presentation(): Presentation {
    return this._presentation
  }

  /**
   * Returns the {@link AsciidocFile} that was the base of the generated {@link Presentation}.
   * @since 0.2.0
   */
  public get sourceFile(): AsciidocFile {
    return this.presentation.sourceFile
  }

  /**
   * Returns the base filename of the {@link RenderOutput}. This is the filename without the extension of the
   * {@link RenderOutput.sourceFile sourceFile}.
   * @protected
   */
  protected get baseFilename(): string {
    return this.sourceFile.fileName.replace(/\.[^/.]+$/, '')
  }

  /**
   * Returns the extension for the output file.
   * @since 0.2.0
   */
  public abstract get extension(): string

  /**
   * Returns the filename for the output file. This is simply the presentation file name with the output format
   * extension appended.
   * @since 0.2.0
   */
  public get outFilename(): string {
    return `${this.baseFilename}.${this.extension}`
  }

  /**
   * Converts the content of the {@link RenderOutput} to a file-writable format.
   * @since 0.2.0
   */
  public abstract write(): Promise<OutT>
}
