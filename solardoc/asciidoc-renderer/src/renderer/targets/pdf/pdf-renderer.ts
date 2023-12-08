import { NodePDFRenderer } from "./node/node-pdf-renderer"
import * as env from "../../../utils/det-env"
import {WebPDFRenderer} from "./web/web-pdf-renderer";

/**
 * Renders a presentation or slide to a PDF file.
 * @since 0.2.0
 */
export const PDFRenderer: typeof NodePDFRenderer | typeof WebPDFRenderer = env.detEnv() === env.NODE ?
  NodePDFRenderer
  : WebPDFRenderer
