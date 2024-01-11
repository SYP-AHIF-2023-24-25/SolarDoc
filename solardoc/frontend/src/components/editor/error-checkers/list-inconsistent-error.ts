import type { IMarkerData } from '@/components/editor/error-checking'
import constants from '@/plugins/constants'
import * as monaco from 'monaco-editor'

export function listInconsistentError(lines: Array<string>): Array<IMarkerData> {
  const markers: IMarkerData[] = []

  let currentListSymbol: string | null = null
  let lineNumber = 0
  for (const line of lines) {
    // Checking for list errors (continuing a list with a different symbol)
    const match = line.match(/^([*.])\s+[a-zA-Z]/)
    if (match) {
      const listSymbol = match[1]

      // Check if the list symbol changes
      if (currentListSymbol && currentListSymbol !== listSymbol) {
        console.log('list symbol changed' + currentListSymbol + ' ' + listSymbol)
        const startColumn = line.indexOf(listSymbol) + 1
        const endColumn = startColumn + 1
        const message = constants.errorMessages['list-inconsistent-error']
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: message,
          startLineNumber: lineNumber + 1, // Lines are 1-indexed
          startColumn: startColumn,
          endLineNumber: lineNumber + 1,
          endColumn: endColumn,
        })
      }
      currentListSymbol = listSymbol
    } else {
      // In case there is a different line, reset the current list symbol to null, to avoid wrong errors
      currentListSymbol = null
    }
    lineNumber++
  }
  return markers
}
