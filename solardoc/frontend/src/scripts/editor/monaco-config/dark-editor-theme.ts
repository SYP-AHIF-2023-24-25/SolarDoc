import type {editor} from 'monaco-editor/esm/vs/editor/editor.api'

export const darkEditorTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: false,
  rules: [
    { token: 'header', foreground: '#5a35d3', fontStyle: 'bold' },
    { token: 'bold', foreground: '#1100ff', fontStyle: 'bold' },
    { token: 'italic', foreground: '#ff00fb', fontStyle: 'italic' },
    { token: 'code', foreground: '#c4c200' },
    { token: 'link', foreground: '#65c400', fontStyle: 'italic' },
    { token: 'unordered', foreground: '#009691', fontStyle: 'bold' },
    { token: 'ordered', foreground: '#0066b9', fontStyle: 'bold' },
    { token: 'check-boxes', foreground: '#be005e' },
    { token: 'comment', foreground: '#65707c', fontStyle: 'italic' },
    { token: 'special-token', foreground: '#7f7f7f', fontStyle: 'bold' },
    { token: 'bold-italic', foreground: '#750046', fontStyle: 'bold italic' },
  ],
  colors: {
    'editor.background': '#0f111a',
    'editor.foreground': '#ffffff',
    'editor.selectionBackground': '#2e3b4d',
    'editor.lineHighlightBackground': '#1e2133',
    'editorCursor.foreground': '#80a4c2',
    'editorWhitespace.foreground': '#2e2040',
    'editorIndentGuide.background': '#5e81ce52',
    'editor.selectionHighlightBorder': '#122d42',
  },
}
