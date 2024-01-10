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

  /**
   * Returns the file size in the given format.
   * @param format The format in which the file size should be returned. Default: 'B' (Bytes)
   * @returns The file size in the given format.
   * @since 0.3.0
   */
  public getFileSize(format: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' = 'B'): number {
    switch (format) {
      case 'B':
        return this._fileSize
      case 'KB':
        return this._fileSize / 1024
      case 'MB':
        return this.getFileSize('KB') / 1024
      case 'GB':
        return this.getFileSize('MB') / 1024
      case 'TB':
        return this.getFileSize('GB') / 1024
      case 'PB':
        return this.getFileSize('TB') / 1024
      default:
        throw new Error(`Unknown format: ${format}`)
    }
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
