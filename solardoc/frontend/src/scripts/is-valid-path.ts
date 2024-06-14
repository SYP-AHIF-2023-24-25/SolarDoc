/**
 * Check if the path is valid using a regex.
 * @param path The path to check.
 */
export function isValidPath(path: string): boolean {
  return /^\/[a-zA-Z0-9-]+(\/[a-zA-Z0-9-]+)*$/.test(path)
}
