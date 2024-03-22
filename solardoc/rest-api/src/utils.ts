import { Request } from '@loopback/rest'
import path from 'path'
import { API_BASE_PATH } from './index'
import {isDev} from "./env";

/**
 * Returns the current date in seconds.
 *
 * This is using the Unix epoch (January 1st, 1970 at 00:00:00 UTC) as the starting point for the timestamp.
 * @since 0.2.0
 */
export function getDateNowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Get the host that the user called the API on i.e. the public URL of the API.
 * @since 0.2.0
 */
export function getHostURL(req: Request): string {
  const protocol = isDev ? 'http' : 'https'
  return (new URL(`${protocol}://${req.headers.host!}`)).origin
}

/**
 * Returns the file extension of the given filename.
 * @param filename The filename to get the extension of.
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename)
}

/**
 * Checks the file extension and returns the corresponding MIME type.
 *
 * This is not a full implementation and does NOT adhere to the full MIME type specification. It only supports the
 * ones we need for this application.
 * @param ext The file extension to check.
 * @since 0.2.0
 */
export function checkFileExtensionForMimeType(ext: string) {
  switch (ext) {
    case '.pdf':
      return 'application/pdf'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.html':
      return 'text/html'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Trims the first slash from the given string.
 * @param str The string to trim the first slash from.
 */
function trimFirstSlash(str: string): string {
  return str.startsWith('/') ? str.slice(1) : str
}

/**
 * Trims the last slash from the given string.
 * @param str The string to trim the last slash from.
 */
function trimLastSlash(str: string): string {
  return str.endsWith('/') ? str.slice(0, -1) : str
}

/**
 * Builds the URL to a specific API route.
 * @param req The request to get the host from.
 * @param controllerBase The base path to the controller.
 * @param subRoutePath The path to the route relative to {@link controllerBase}.
 */
export function buildAPIURL(req: Request, controllerBase: string, subRoutePath: string): string {
  controllerBase = trimLastSlash(trimFirstSlash(controllerBase))
  subRoutePath = trimLastSlash(trimFirstSlash(subRoutePath))
  return `${getHostURL(req)}${API_BASE_PATH}/${controllerBase}/${subRoutePath}`
}
