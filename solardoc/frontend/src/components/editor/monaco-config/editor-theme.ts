// editor-theme.js

export const editorTheme = {
  base: 'vs',
  inherit: false,
  rules: [
    { token: 'header', foreground: '#4d2db7', fontStyle: 'bold' },
    { token: 'bold', foreground: '#1100ff', fontStyle: 'bold' },
    { token: 'italic', foreground: '#ff00fb', fontStyle: 'italic' },
    { token: 'code', foreground: '#c4c200' },
    { token: 'link', foreground: '#65c400', fontStyle: 'italic' },
    { token: 'unordered', foreground: '#009691', fontStyle: 'bold' },
    { token: 'ordered', foreground: '#0066b9', fontStyle: 'bold' },
    { token: 'check-boxes', foreground: '#be005e' },
    { token: 'comment', foreground: '#657c6e', fontStyle: 'italic' },
    { token: 'special-token', foreground: '#b0b0b0', fontStyle: 'bold' },
    { token: 'bold-italic', foreground: '#750046', fontStyle: 'bold italic' }
  ],
  colors: {
    'editor.foreground': '#000000'
  }
}
