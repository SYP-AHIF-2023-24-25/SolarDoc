/**
 * Error thrown when an error occurs in the AsciidocRenderer.
 * @since 0.2.0
 */
export class AsciidocRendererError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AsciidocRendererError';
    }
}

