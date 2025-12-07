import { monaco as monacoEditor } from 'react-monaco-editor'

export const jmespathLanguageConfiguration: monacoEditor.languages.LanguageConfiguration =
  {
    brackets: [
      ['(', ')'],
      ['{', '}'],
      ['[', ']'],
      ["'", "'"],
      ['"', '"'],
    ],
    comments: {
      blockComment: ['/*', '*/'],
      lineComment: '//',
    },
  }
