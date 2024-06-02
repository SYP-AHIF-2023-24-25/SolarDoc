import type { IMarkerData } from '@/scripts/editor/error-checking'
import constants from '@/plugins/constants'
import * as monaco from 'monaco-editor'

export function headingSpaceMissingError(lines: Array<string>): Array<IMarkerData> {
  const markers: IMarkerData[] = []

  let lineNumber = 0
  for (const line of lines) {
    if (line.match(/^={1,6}[^ =].*$/)) {
      const startColumn = line.indexOf('=') + 1
      const endColumn = line.length
      const message = constants.errorMessages['heading-space-missing-error']
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: message,
        startLineNumber: lineNumber + 1,
        startColumn: startColumn,
        endLineNumber: lineNumber + 1,
        endColumn: endColumn,
      })
    }
    lineNumber++
  }
  return markers
}
