import type { Ref } from 'vue'
import type { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import type { OTrans } from '@/services/phoenix/ot-trans'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { lightEditorTheme } from '@/scripts/editor/monaco-config/light-editor-theme'
import { darkEditorTheme } from '@/scripts/editor/monaco-config/dark-editor-theme'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useInitStateStore } from '@/stores/init-state'
import { performErrorChecking } from '@/scripts/editor/error-checking'
import { type Permission, Permissions, useCurrentFileStore } from '@/stores/current-file'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentUserStore } from '@/stores/current-user'
import asciiDocLangMonarch from '@/scripts/editor/monaco-config/asciidoc-lang-monarch'
import { triggerPreviewRerender } from '@/scripts/editor/render'
import { createOTUpdates } from '@/scripts/editor/ot/create-ot'
import { getMonacoUpdatesFromOT } from '@/scripts/editor/ot/get-monaco-updates'
import { sendOTUpdates } from '@/scripts/editor/ot/send-ot'
import { EditorModelNotFoundError } from '@/errors/editor-model-not-found-error'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { storeToRefs } from 'pinia'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()
const editorUpdateWSClient = useEditorUpdateWSClient()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()

const { slideIndex, subSlideIndex } = storeToRefs(previewSelectedSlideStore)

let monacoSetUp = false

function setUpMonaco() {
  if (monacoSetUp) return
  monacoSetUp = true

  // Required for web-worker optimisation
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    },
  }

  // Register a new language
  monaco.languages.register({ id: 'asciiDoc' })

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider(
    'asciiDoc',
    <languages.IMonarchLanguage>asciiDocLangMonarch,
  )

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme('asciiDocLightTheme', <editor.IStandaloneThemeData>lightEditorTheme)
  monaco.editor.defineTheme('asciiDocDarkTheme', <editor.IStandaloneThemeData>darkEditorTheme)
}

/**
 * A global instance of a Monaco editor. This is used to access the editor from anywhere in the application.
 *
 * This exists because the original plan of creating a class for the editor was not working, as using a class wrapper
 * caused reactivity errors in Vue. This makes it much more ugly and harder to manage, but it works.
 * @since 0.7.0
 */
let globalMonacoEditor!: editor.IStandaloneCodeEditor | null

/**
 * Class that manages the global Monaco editor instance.
 *
 * This was originally not a purely static class, but due to reactivity issues in Vue, it was changed to a static class,
 * as otherwise the monaco would break and freeze the application due to internal bugs.
 * @since 0.7.0
 */
export class SolardocEditor {
  public readonly name = 'SolardocEditor'
  private static _readonly?: boolean
  private static _locked?: boolean

  /**
   * Creates a new instance of the {@link monaco.editor} and binds it to the given element.
   *
   * This instance will be managed by this class and can be accessed through the {@link monacoEditor} getter.
   * @param elementToBindTo
   * @param initialState
   */
  public static initMonacoEditor(
    elementToBindTo: Ref<HTMLElement>,
    initialState: {
      darkMode?: boolean
      content?: string
      permissions?: Permission
    },
  ) {
    setUpMonaco()
    if (globalMonacoEditor != null) {
      this._destroy()
    }

    globalMonacoEditor = monaco.editor.create(elementToBindTo.value, {
      theme: initialState.darkMode ? 'asciiDocDarkTheme' : 'asciiDocLightTheme',
      language: 'asciiDoc',
      value: undefined,
      fontFamily: 'JetBrains Mono',
      minimap: {
        enabled: false,
      },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
    })

    // We need to set the content after the editor is created due to a weird bug in Monaco (See #146)
    this._applyInitContent(`${initialState.content}` || '')
    this._locked = false
    this._readonly = false

    if (initialState.permissions === Permissions.Read) {
      globalMonacoEditor!.updateOptions({
        readOnly: true,
      })
      this._readonly = true
    }

    this._startCursorWatchers()
    this._startContentWatchers()
  }

  public static get monacoEditor() {
    return globalMonacoEditor!
  }

  /**
   * Navigates the editor to the section corresponding to current slide index.
   * @since 1.0.0
   */
  public static redirectCursorToArea() {
    const content = this.getContent()
    const lines = content.split('\n')

    let lineNumber = 1
    let currentSlideIndex = 0
    let currentSubSlideIndex = -1

    for (
      let i = 1;
      i < lines.length &&
      !(
        currentSlideIndex === slideIndex.value &&
        (subSlideIndex.value === undefined || currentSubSlideIndex === subSlideIndex.value)
      );
      i++
    ) {
      lineNumber++
      const line = lines[i]

      if (line.startsWith('== ')) {
        currentSlideIndex++
        currentSubSlideIndex = -1
      }
      if (line.startsWith('=== ')) {
        currentSubSlideIndex++
      }
    }

    const position = new monaco.Position(lineNumber, lines[lineNumber - 1].length + 1)
    this.monacoEditor.setPosition(position)
    this.monacoEditor.revealPositionNearTop(position)
    this.monacoEditor.focus()
  }

  /**
   * Returns whether the Monaco editor has been initialised.
   * @since 1.0.0
   */
  public static get initialised() {
    return globalMonacoEditor != null
  }

  /**
   * Returns whether the editor is locked. This indicates that currently an update is being processed from the remote.
   * @since 0.7.0
   */
  public static get isLocked() {
    return this._locked
  }

  /**
   * Returns whether the editor is readonly. This is always caused by insufficient permissions by the user.
   * @since 0.7.0
   */
  public static get isReadonly() {
    return this._readonly
  }

  /**
   * Runs the standard Solardoc-specific error checking on the editor content.
   * @since 0.7.0
   */
  public static performErrorChecking() {
    performErrorChecking(globalMonacoEditor!)
  }

  /**
   * Sets the content of the editor.
   * @since 0.7.0
   */
  public static setContent(content: string) {
    globalMonacoEditor!.setValue(content)
  }

  /**
   * Sets the content of the editor if the editor has been initialised.
   * @param content The content to set.
   */
  public static setContentIfAvailable(content: string) {
    if (this.initialised) {
      globalMonacoEditor!.setValue(content)
    }
  }

  /**
   * Returns the content of the editor.
   * @since 0.7.0
   */
  public static getContent() {
    return globalMonacoEditor!.getValue()
  }

  public static setTheme(darkMode: boolean) {
    globalMonacoEditor!.updateOptions({
      theme: darkMode ? 'asciiDocDarkTheme' : 'asciiDocLightTheme',
    })
  }

  public static async applyOTrans(oTrans: OTrans) {
    const editorModel = globalMonacoEditor!.getModel()
    if (oTrans.user_id == currentUserStore.currentUser!.id) {
      return
    } else if (editorModel == null) {
      throw new EditorModelNotFoundError()
    } else if (oTrans.init) {
      // The init transformation should not be applied and only the init content should be set
      await this._runThreadSafe(async () => globalMonacoEditor!.setValue(currentFileStore.content))
      return
    } else {
      await this._runThreadSafe(async () => {
        const edits: Array<editor.IIdentifiedSingleEditOperation> = getMonacoUpdatesFromOT(
          editorModel,
          oTrans,
        )
        globalMonacoEditor!.executeEdits(this.name, edits)
      })
    }
  }

  private static _startCursorWatchers() {
    globalMonacoEditor!.onDidChangeCursorPosition(event => {
      const lineNumber = event.position.lineNumber

      const content = this.getContent()
      if (!content) return

      const lines = content.split('\n')
      const { slideIndex, subSlideIndex } = lines.slice(0, lineNumber).reduce(
        (acc, line) => {
          line = line.trim()
          if (line.startsWith('== ')) {
            acc.slideIndex++
            acc.subSlideIndex = -1
          } else if (line.startsWith('=== ')) {
            acc.subSlideIndex++
          }
          return acc
        },
        { slideIndex: 0, subSlideIndex: -1 },
      )
      previewSelectedSlideStore.setSlide(slideIndex, false, subSlideIndex)
    })
  }

  private static _startContentWatchers() {
    globalMonacoEditor!.onDidChangeModelContent(this.performErrorChecking)
    globalMonacoEditor!.onDidChangeModelContent(async (event: editor.IModelContentChangedEvent) => {
      // We always trigger the re-render of the preview when the editor content changes
      previewLoadingStore.setPreviewLoading(true)
      initStateStore.setInit(false)
      await triggerPreviewRerender(globalMonacoEditor!)

      // If the editor is locked, then the server has sent an update, and we are currently updating the editor
      // This means this update is not user input, and we should not send it to the server
      if (this.isLocked) {
        return
      }

      currentFileStore.resetLastModified()
      const changeOTUpdates = await createOTUpdates(event.changes)

      // Voiding the promise here to avoid the need to await it and avoiding blocking the editor UI
      void sendOTUpdates(changeOTUpdates, editorUpdateWSClient.hasActiveChannelConnection)
    })
  }

  private static _lock() {
    this._locked = true
  }

  private static _unlock() {
    this._locked = false
  }

  /**
   * Runs a promise in a thread-safe manner. This means that the promise will only be executed if the editor is not
   * locked and if it is locked, the promise will be executed after the lock is released.
   * @param promise The promise to run
   * @private
   */
  private static async _runThreadSafe(promise: () => Promise<void>): Promise<void> {
    if (this.isLocked) {
      await this._waitForUnlock()
    }
    this._lock()
    await promise()
    this._unlock()
  }

  /**
   * Returns a promise which resolves when the editor is unlocked.
   * @private
   */
  private static _waitForUnlock(): Promise<void> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (!this.isLocked) {
          clearInterval(interval)
          resolve(undefined)
        }
      }, 100)
    })
  }

  /**
   * Applies the initial content to the editor. This is used to set the initial content of the editor when it is
   * created.
   *
   * This is required due to bug #146 in Monaco, where setting the content in the editor creation options does not work.
   * @param content The content to set.
   * @private
   */
  private static _applyInitContent(content: string) {
    globalMonacoEditor!.setValue(content)
    document.fonts.ready.then(() => {
      monaco.editor.remeasureFonts()
      this._forceRerender()
    })
  }

  private static _forceRerender() {
    globalMonacoEditor!.render()
  }

  /**
   * @since 1.0.0
   * @private
   */
  private static _destroy(): void {
    globalMonacoEditor?.setModel(null)
    globalMonacoEditor?.dispose()
    globalMonacoEditor = null
  }
}
