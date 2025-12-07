import { monaco as monacoEditor } from 'react-monaco-editor'
import { remove } from 'lodash'
import { IRedisCommandTree } from 'uiSrc/constants'
import {
  generateKeywords,
  generateTokens,
  generateTokensWithFunctions,
  getBlockTokens,
  isIndexAfterKeyword,
  isQueryAfterIndex,
} from 'uiSrc/utils/monaco/redisearch/utils'
import { generateQuery } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensTemplates'

const STRING_DOUBLE = 'string.double'

export const getRediSearchSubRedisMonarchTokensProvider = (
  commands: IRedisCommandTree[],
): monacoEditor.languages.IMonarchLanguage => {
  const withoutIndexSuggestions = [...commands]
  const withNextIndexSuggestions = remove(
    withoutIndexSuggestions,
    isIndexAfterKeyword,
  )
  const withNextQueryIndexSuggestions = remove(
    [...withNextIndexSuggestions],
    isQueryAfterIndex,
  )

  const generateTokensForCommands = () => {
    let commandTokens: any = {}

    commands.forEach((command) => {
      const isIndexAfterCommand = isIndexAfterKeyword(command)
      const argTokens = generateTokens(command)
      const tokenName = command.token?.replace(/(\.| )/g, '_')
      const blockTokens = getBlockTokens(tokenName, argTokens?.pureTokens)

      if (blockTokens.length) {
        commandTokens[`argument.block.${tokenName}`] = blockTokens
      }

      if (isIndexAfterCommand) {
        commandTokens = {
          ...commandTokens,
          ...generateTokensWithFunctions(
            tokenName,
            argTokens?.tokensWithQueryAfter,
          ),
        }
      }
    })

    return commandTokens
  }

  const tokens = generateTokensForCommands()

  const includeTokens = () => {
    const tokensToInclude = Object.keys(tokens).filter((name) =>
      name.startsWith('argument.block'),
    )
    return tokensToInclude.map((include) => ({ include: `@${include}` }))
  }

  return {
    defaultToken: '',
    tokenPostfix: '.redisearch',
    includeLF: true,
    ignoreCase: true,
    brackets: [
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],
    keywords: [],
    tokenizer: {
      root: [
        { include: '@startOfLine' },
        { include: '@keywords' },
        ...includeTokens(),
        { include: '@fields' },
        { include: '@whitespace' },
        { include: '@numbers' },
        { include: '@strings' },
        [/[;,.]/, 'delimiter'],
        [/[()]/, '@brackets'],
        [/[<>=!%&+\-*/|~^]/, 'operator'],
        [/[\w@#$.]+/, 'identifier'],
      ],
      keywords: [
        [
          `^\\s*(\\d\\s)?(${generateKeywords(withNextQueryIndexSuggestions).join('|')})\\b`,
          { token: 'keyword', next: '@index.query' },
        ],
        [
          `^\\s*(\\d\\s)?(${generateKeywords(withNextIndexSuggestions).join('|')})\\b`,
          { token: 'keyword', next: '@index' },
        ],
        [
          `^\\s*(\\d\\s)?(${generateKeywords(withoutIndexSuggestions).join('|')})\\b`,
          { token: 'keyword', next: '@root' },
        ],
      ],
      ...tokens,
      ...generateQuery(),
      index: [
        [/"([^"\\]|\\.)*"/, { token: 'index', next: '@root' }],
        [/'([^'\\]|\\.)*'/, { token: 'index', next: '@root' }],
        [/[\w:]+/, { token: 'index', next: '@root' }],
        { include: 'root' }, // Fallback to the root state if nothing matches
      ],
      'index.query': [
        [/"([^"\\]|\\.)*"/, { token: 'index', next: '@query' }],
        [/'([^'\\]|\\.)*'/, { token: 'index', next: '@query' }],
        [/[\w:]+/, { token: 'index', next: '@query' }],
        { include: 'root' }, // Fallback to the root state if nothing matches
      ],
      fields: [[/@\w+/, { token: 'field' }]],
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
      startOfLine: [[/\s?\n/, { next: '@root', token: '@pop' }]],
    },
  }
}
