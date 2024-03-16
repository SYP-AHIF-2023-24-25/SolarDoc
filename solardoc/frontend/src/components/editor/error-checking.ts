import * as monaco from 'monaco-editor'
import { editor } from 'monaco-editor'
import { headingSpaceMissingError } from '@/components/editor/error-checkers/heading-space-missing-error'
import { listInconsistentError } from '@/components/editor/error-checkers/list-inconsistent-error'

export type IMarkerData = editor.IMarkerData

/**
 * All error checkers that are used to check the editor content for errors.
 * @since 0.3.0
 */
const errorCheckers = [headingSpaceMissingError, listInconsistentError]

/**
 * Checks the editor content for errors and adds markers to the editor.
 * (if a heading doesn't have a space after the equal signs or if a list is inconsistent)
 * @since 0.3.0
 */
export function performErrorChecking(editorInstance: monaco.editor.IStandaloneCodeEditor) {
  const model = editorInstance?.getModel()
  if (!model) return

  const lines = model.getLinesContent()
  const markers: IMarkerData[] = []
  for (const errorChecker of errorCheckers) {
    const errorCheckerMarkers = errorChecker(lines)
    markers.push(...errorCheckerMarkers)
  }

  // Update markers in the editor
  monaco.editor.setModelMarkers(model, 'asciidoc', markers)
}
