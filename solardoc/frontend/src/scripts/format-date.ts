export function getHumanReadableTimeInfo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffSeconds = Math.round(diff / 1000)

  if (diffSeconds < 10) {
    return `a few seconds ago`
  }
  else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`
  }
  else if (diffSeconds < 120) {
    return `a minute ago`
  }
  else if (diffSeconds < 3600) {
    return `${Math.round(diffSeconds / 60)} minutes ago`
  }
  else if (diffSeconds < 7200) {
    return `an hour ago`
  }
  else if (diffSeconds < 86400) {
    return `${Math.round(diffSeconds / 3600)} hours ago`
  }
  else if (diffSeconds < 172800) {
    return `a day ago`
  }
  else {
    return `${Math.round(diffSeconds / 86400)} days ago`
  }
}
