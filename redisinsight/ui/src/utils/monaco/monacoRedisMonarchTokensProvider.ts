import { monaco as monacoEditor } from 'react-monaco-editor'
import { remove } from 'lodash'
import { ModuleCommandPrefix } from 'uiSrc/pages/workbench/constants'
import { IRedisCommand } from 'uiSrc/constants'
import { sanitizeToken } from 'uiSrc/utils'

const STRING_DOUBLE = 'string.double'

export const getRedisMonarchTokensProvider = (
  commands: IRedisCommand[],
): monacoEditor.languages.IMonarchLanguage => {
  const commandRedisCommands = [...commands]
  const searchCommands = remove(commandRedisCommands, ({ token }) =>
    token?.startsWith(ModuleCommandPrefix.RediSearch),
  )
  const COMMON_COMMANDS_REGEX = `^\\s*(\\d+\\s+)?(${commandRedisCommands.map(({ token }) => sanitizeToken(token)).join('|')})\\b`
  const SEARCH_COMMANDS_REGEX = `^\\s*(\\d+\\s+)?(${searchCommands.map(({ token }) => sanitizeToken(token)).join('|')})\\b`

  return {
    defaultToken: '',
    tokenPostfix: '.redis',
    ignoreCase: true,
    includeLF: true,
    brackets: [
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],
    keywords: [],
    operators: [],
    tokenizer: {
      root: [
        { include: '@startOfLine' },
        { include: '@whitespace' },
        { include: '@strings' },
        { include: '@keyword' },
        [/[;,.]/, 'delimiter'],
        [/[()]/, '@brackets'],
        [
          /[\w@#$]+/,
          {
            cases: {
              '@keywords': 'keyword',
              '@operators': 'operator',
              '@default': 'identifier',
            },
          },
        ],
        [/[<>=!%&+\-*/|~^]/, 'operator'],
        { include: '@numbers' },
      ],
      keyword: [
        [COMMON_COMMANDS_REGEX, { token: 'keyword' }],
        [
          SEARCH_COMMANDS_REGEX,
          {
            token: '@rematch',
            nextEmbedded: 'redisearch',
            next: '@endRedisearch',
          },
        ],
      ],
      whitespace: [
        [/\s+/, 'white'],
        [/\/\/.*/, 'comment'],
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
        [/\\./, 'string'],
        [/'/, { token: 'string', next: '@pop' }],
        [/[^\\']+/, 'string'],
      ],
      stringDouble: [
        [/\\./, STRING_DOUBLE],
        [/"/, { token: STRING_DOUBLE, next: '@pop' }],
        [/[^\\"]+/, STRING_DOUBLE],
      ],
      // TODO: can be tokens or functions the same - need to think how to avoid wrong ending
      endRedisearch: [
        [
          `^\\s*${COMMON_COMMANDS_REGEX}`,
          {
            token: '@rematch',
            next: '@root',
            nextEmbedded: '@pop',
            log: 'end',
          },
        ],
      ],
      startOfLine: [[/\n/, { next: '@root', token: '@pop' }]],
    },
  }
}
