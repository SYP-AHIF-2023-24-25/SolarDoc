/**
 * Represents a loaded and parsed asciidoc file.
 * @since 0.2.0
 */
export class AsciidocFile {
  private readonly _content: string
  private readonly _fileName: string
  private readonly _fileSize: number

  public get content(): string {
    return this._content
  }

  public get fileName(): string {
    return this._fileName
  }

  /**
   * The size of the file in bytes.
   * @since 0.3.0
   */
  public get fileSize(): number {
    return this._fileSize
  }

  public constructor(fileName: string, content: string) {
    this._content = content
    this._fileName = fileName
    this._fileSize = Buffer.from(content).length
  }

  /**
   * Loads the given file content into the AsciidocFile.
   * @param fileName The name of the file that should be loaded.
   * @param fileContent The content of the file that should be loaded.
   * @since 0.2.0
   */
  public static async fromString(fileName: string, fileContent: string): Promise<AsciidocFile> {
    return new AsciidocFile(fileName, fileContent)
  }
}
