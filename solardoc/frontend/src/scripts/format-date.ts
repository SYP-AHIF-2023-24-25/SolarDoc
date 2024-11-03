export function getHumanReadableTimeInfo(date: Date | number): string {
  // If the date is a number, convert it to a Date object
  if (typeof date === 'number') {
    date = new Date(date)
  }

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffSeconds = Math.round(diff / 1000)

  if (diffSeconds < 10) {
    return `a few seconds ago`
  } else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`
  } else if (diffSeconds < 120) {
    return `a minute ago`
  } else if (diffSeconds < 3600) {
    return `${Math.round(diffSeconds / 60)} minutes ago`
  } else if (diffSeconds < 7200) {
    return `an hour ago`
  } else if (diffSeconds < 86400) {
    return `${Math.round(diffSeconds / 3600)} hours ago`
  } else if (diffSeconds < 172800) {
    return `a day ago`
  } else {
    return `${Math.round(diffSeconds / 86400)} days ago`
  }
}

/**
 * Get the human-readable date of a Date object. (use the timezone of the client)
 * @param date The date to format, can be a Date object or a number (timestamp)
 */
export function getHumanReadablePreciseDate(date: Date | number): string {
// If the date is a number, convert it to a Date object
  if (typeof date === 'number') {
    date = new Date(date)
  }

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Get the timezone offset in hours
  const timezoneOffset = -date.getTimezoneOffset() / 60
  const timezoneOffsetString = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`

  return `${day}.${month}.${year} ${hours}:${minutes} (${timezoneOffsetString})`
}
