import { monaco as monacoEditor } from 'react-monaco-editor'

export const redisLanguageConfig: monacoEditor.languages.LanguageConfiguration =
  {
    wordPattern: /\w+\.?(\w?)+/g,
    comments: {
      lineComment: '//',
      // blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      offSide: true,
      markers: {
        start: new RegExp('^\\s*#region\\b'),
        end: new RegExp('^\\s*#endregion\\b'),
      },
    },
  }
