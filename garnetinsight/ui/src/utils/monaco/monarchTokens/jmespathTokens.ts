import { monaco as monacoEditor } from 'react-monaco-editor'

const STRING_DOUBLE = 'string.double'

export const getJmespathMonarchTokensProvider = (
  functions: string[],
): monacoEditor.languages.IMonarchLanguage => ({
  defaultToken: '',
  tokenPostfix: '.jmespath',
  ignoreCase: true,
  brackets: [
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],
  functions,
  operators: [
    // NOT SUPPORTED
  ],
  builtinFunctions: [
    // NOT SUPPORTED
  ],
  builtinVariables: [
    // NOT SUPPORTED
  ],
  pseudoColumns: [
    // NOT SUPPORTED
  ],
  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@pseudoColumns' },
      { include: '@numbers' },
      { include: '@strings' },
      { include: '@scopes' },
      { include: '@keyword' },
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [
        /[\w@#$]+/,
        {
          cases: {
            '@functions': 'keyword',
            '@operators': 'operator',
            '@builtinVariables': 'predefined',
            '@builtinFunctions': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
      [/[<>=!%&+\-*/|~^]/, 'operator'],
    ],
    keyword: [[`\\b(${functions.join('|')})(?=\\s*\\()`, 'keyword']],
    whitespace: [
      [/\s+/, 'white'],
      [/\/\/.*$/, 'comment'],
    ],
    pseudoColumns: [
      [
        /[$][A-Za-z_][\w@#$]*/,
        {
          cases: {
            '@pseudoColumns': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
    ],
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
    scopes: [
      // NOT SUPPORTED
    ],
  },
})
