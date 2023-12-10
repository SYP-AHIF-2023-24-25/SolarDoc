/**
 * Returns the current date in seconds.
 *
 * This is using the Unix epoch (January 1st, 1970 at 00:00:00 UTC) as the starting point for the timestamp.
 * @since 0.2.0
 */
export function getDateNowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
