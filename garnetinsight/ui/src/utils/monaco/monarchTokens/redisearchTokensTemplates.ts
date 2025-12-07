import { languages } from 'monaco-editor'
import { curryRight } from 'lodash'
import { Maybe, sanitizeToken } from 'uiSrc/utils'
import { IRedisCommand } from 'uiSrc/constants'

const appendToken = (token: string, name: Maybe<string>) =>
  name ? `${token}.${name}` : token
export const generateQuery = (
  argToken?: IRedisCommand,
  args?: IRedisCommand[],
): { [name: string]: languages.IMonarchLanguageRule[] } => {
  const curriedAppendToken = curryRight(appendToken)
  const appendTokenName = curriedAppendToken(argToken?.token)

  const getFunctionsTokens = (
    tokenName: string,
  ): languages.IMonarchLanguageRule =>
    args?.length
      ? [
          `(${args?.map(({ token }) => sanitizeToken(token)).join('|')})\\b`,
          { token: 'function', next: appendTokenName(tokenName) },
        ]
      : [/_/, '']

  return {
    [appendTokenName('query')]: [
      [
        /"/,
        {
          token: appendTokenName('query'),
          next: appendTokenName('@query.inside.double'),
        },
      ],
      [
        /'/,
        {
          token: appendTokenName('query'),
          next: appendTokenName('@query.inside.single'),
        },
      ],
      [/[a-zA-Z_]\w*/, { token: appendTokenName('query'), next: '@root' }],
      { include: 'root' }, // Fallback to the root state if nothing matches
    ],
    [appendTokenName('query.inside.double')]: [
      [/@/, { token: 'field', next: appendTokenName('@field.inside.double') }],
      [
        /\\"/,
        { token: 'query', next: appendTokenName('@query.inside.double') },
      ],
      [/==|!=|<=|>=|<|>/, { token: 'query.operator' }],
      [/&&|\|\|/, { token: 'query.operator' }],
      [/[()]/, 'delimiter.parenthesis'],
      getFunctionsTokens('@function.inside.double'),
      [/"/, { token: appendTokenName('query'), next: '@root' }],
      [
        /./,
        {
          token: appendTokenName('query'),
          next: appendTokenName('@query.inside.double'),
        },
      ],
      { include: '@query' }, // Fallback to the root state if nothing matches
    ],
    [appendTokenName('query.inside.single')]: [
      [/@/, { token: 'field', next: appendTokenName('@field.inside.single') }],
      [
        /\\'/,
        {
          token: appendTokenName('query'),
          next: appendTokenName('query.inside.single'),
        },
      ],
      [/==|!=|<=|>=|<|>/, { token: 'query.operator' }],
      [/&&|\|\|/, { token: 'query.operator' }],
      [/[()]/, 'delimiter.parenthesis'],
      getFunctionsTokens('@function.inside.single'),
      [/'/, { token: appendTokenName('query'), next: '@root' }],
      [
        /./,
        {
          token: appendTokenName('query'),
          next: appendTokenName('@query.inside.single'),
        },
      ],
      { include: appendTokenName('@query') }, // Fallback to the root state if nothing matches
    ],
    [appendTokenName('field.inside.double')]: [
      [
        /\w+/,
        { token: 'field', next: appendTokenName('@query.inside.double') },
      ],
      [
        /\s+/,
        { token: '@rematch', next: appendTokenName('@query.inside.double') },
      ],
      [/"/, { token: appendTokenName('query'), next: '@root' }],
      { include: appendTokenName('@query') }, // Fallback to the root state if nothing matches
    ],
    [appendTokenName('field.inside.single')]: [
      [
        /\w+/,
        { token: 'field', next: appendTokenName('@query.inside.single') },
      ],
      [
        /\s+/,
        { token: '@rematch', next: appendTokenName('@query.inside.single') },
      ],
      [/'/, { token: appendTokenName('query'), next: '@root' }],

      { include: appendTokenName('@query') },
    ],
    [appendTokenName('function.inside.double')]: [
      [/\s+/, 'white'], // Handle whitespace
      [
        /\(/,
        {
          token: 'delimiter.parenthesis',
          next: appendTokenName('@function.args.double'),
        },
      ],
      { include: appendTokenName('@query') },
    ],
    [appendTokenName('function.args.double')]: [
      [
        /\)/,
        {
          token: 'delimiter.parenthesis',
          next: appendTokenName('@query.inside.double'),
        },
      ],
      [/,/, 'delimiter.comma'], // Match commas between arguments
      getFunctionsTokens('@function.inside.double'),
      [/[a-zA-Z_]\w*/, { token: 'parameter' }], // Highlight parameters
      [/\s+/, 'white'], // Handle whitespace
      [/@\w+/, { token: 'field' }],

      // // Handle strings with escaped quotes
      [/\\"/, 'parameter'], // Match escaped double quote
      [/\\'/, 'parameter'], // Match escaped single quote
      [/'/, 'parameter'], // Match escaped single quote

      { include: appendTokenName('@query') }, // Fallback to root state
    ],
    [appendTokenName('function.inside.single')]: [
      [/\s+/, 'white'], // Handle whitespace
      [
        /\(/,
        {
          token: 'delimiter.parenthesis',
          next: appendTokenName('@function.args.single'),
        },
      ],
      { include: appendTokenName('@query') },
    ],
    [appendTokenName('function.args.single')]: [
      [
        /\)/,
        {
          token: 'delimiter.parenthesis',
          next: appendTokenName('@query.inside.single'),
        },
      ],
      [/,/, 'delimiter.comma'], // Match commas between arguments
      getFunctionsTokens('@function.inside.single'),
      [/[a-zA-Z_]\w*/, { token: 'parameter' }], // Highlight parameters
      [/\s+/, 'white'], // Handle whitespace
      [/@\w+/, { token: 'field' }],

      [/"/, 'parameter'], // Match escaped double quote
      // // Handle strings with escaped quotes
      [/\\"/, 'parameter'], // Match escaped double quote
      [/\\'/, 'parameter'], // Match escaped single quote

      { include: appendTokenName('@query') }, // Fallback to root state
    ],
  }
}
