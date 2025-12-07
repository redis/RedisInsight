import { monaco as monacoEditor } from 'react-monaco-editor'
import {
  FUNCTIONS,
  KEYWORDS,
  OPERATORS,
} from 'uiSrc/constants/monaco/cypher/monacoCypher'

const STRING_DOUBLE = 'string.double'
const functions = FUNCTIONS.map((f) => f.label)

export const getCypherMonarchTokensProvider =
  (): monacoEditor.languages.IMonarchLanguage => ({
    defaultToken: '',
    tokenPostfix: '.cypher',
    ignoreCase: true,
    brackets: [
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
      { open: '{', close: '}', token: 'delimiter.curly' },
    ],
    keywords: KEYWORDS,
    operators: OPERATORS,
    functions,
    strings: [],
    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@numbers' },
        { include: '@keyword' },
        { include: '@function' },
        [/[;,.]/, 'delimiter'],
        // eslint-disable-next-line
        [/[{}()\[\]]/, '@brackets'],
        [
          /[\w@#$]+/,
          {
            cases: {
              '@keywords': 'keyword',
              '@functions': 'function',
              '@default': 'identifier',
            },
          },
        ],
        { include: '@strings' },
      ],
      keyword: [[`\\b(${KEYWORDS.join('|')})\\b`, 'keyword']],
      function: [[`\\b(${functions.join('|')})(?=\\s*\\()`, 'function']],
      strings: [
        [/'/, { token: 'string', next: '@string' }],
        [/"/, { token: STRING_DOUBLE, next: '@stringDouble' }],
      ],
      string: [
        [/[^']+/, 'string'],
        [/''/, 'string'],
        [/'/, { token: 'string', next: '@pop' }],
      ],
      stringDouble: [
        [/[^"]+/, STRING_DOUBLE],
        [/""/, STRING_DOUBLE],
        [/"/, { token: STRING_DOUBLE, next: '@pop' }],
      ],
      whitespace: [
        [/\s+/, 'white'],
        [/\/\/.*$/, 'comment'],
      ],
      numbers: [
        [/0[xX][0-9a-fA-F]*/, 'number'],
        [/[$][+-]*\d*(\.\d*)?/, 'number'],
        [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
      ],
    },
  })
