import { isNumber, remove } from 'lodash'
import { languages } from 'monaco-editor'
import { Maybe, Nullable, sanitizeToken } from 'uiSrc/utils'
import { generateQuery } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensTemplates'
import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'
import { DefinedArgumentName } from 'uiSrc/pages/workbench/constants'

export const generateKeywords = (commands: IRedisCommand[]) =>
  commands.map(({ name }) => name)
export const generateTokens = (
  command?: IRedisCommand,
): Nullable<{
  pureTokens: Array<Array<IRedisCommand>>
  tokensWithQueryAfter: Array<
    Array<{ token: IRedisCommand; arguments: IRedisCommand[] }>
  >
}> => {
  if (!command) return null
  const pureTokens: Array<Array<IRedisCommand>> = []
  const tokensWithQueryAfter: Array<
    Array<{ token: IRedisCommand; arguments: IRedisCommand[] }>
  > = []

  function processArguments(args: IRedisCommand[], level = 0) {
    if (!pureTokens[level]) pureTokens[level] = []
    if (!tokensWithQueryAfter[level]) tokensWithQueryAfter[level] = []

    args.forEach((arg) => {
      if (arg.token) pureTokens[level].push(arg)

      if (arg.type === ICommandTokenType.Block && arg.arguments) {
        const blockToken = arg.arguments[0]
        const nextArgs = arg.arguments
        const isArgHasOwnSyntax =
          arg.arguments[0].expression && !!arg.arguments[0].arguments?.length

        if (blockToken?.token) {
          if (isArgHasOwnSyntax) {
            tokensWithQueryAfter[level].push({
              token: blockToken,
              arguments: arg.arguments[0].arguments as IRedisCommand[],
            })
          } else {
            pureTokens[level].push(blockToken)
          }
        }

        processArguments(
          blockToken ? nextArgs.slice(1, nextArgs.length) : nextArgs,
          level + 1,
        )
      }

      if (arg.type === ICommandTokenType.OneOf && arg.arguments) {
        arg.arguments.forEach((choice) => {
          if (choice?.token) pureTokens[level].push(choice)
        })
      }
    })
  }

  if (command.arguments) {
    processArguments(command.arguments, 0)
  }

  return { pureTokens, tokensWithQueryAfter }
}

export const isIndexAfterKeyword = (command?: IRedisCommand) => {
  if (!command) return false

  const index = command.arguments?.findIndex(
    ({ name }) => name === DefinedArgumentName.index,
  )
  return isNumber(index) && index === 0
}

export const isQueryAfterIndex = (command?: IRedisCommand) => {
  if (!command) return false

  const index = command.arguments?.findIndex(
    ({ name }) => name === DefinedArgumentName.index,
  )
  return isNumber(index) && index > -1
    ? command.arguments?.[index + 1]?.name === DefinedArgumentName.query
    : false
}

export const appendTokenWithQuery = (
  args: Array<{ token: IRedisCommand; arguments: IRedisCommand[] }>,
  level: number,
): languages.IMonarchLanguageRule[] =>
  args.map(({ token }) => [
    `(${token.token})\\b`,
    { token: `argument.block.${level}`, next: `@query.${token.token}` },
  ])

export const appendQueryWithNextFunctions = (
  tokens: Array<{ token: IRedisCommand; arguments: IRedisCommand[] }>,
): {
  [name: string]: languages.IMonarchLanguageRule[]
} => {
  let result: { [name: string]: languages.IMonarchLanguageRule[] } = {}

  tokens.forEach(({ token, arguments: args }) => {
    result = {
      ...result,
      ...generateQuery(token, args),
    }
  })

  return result
}

export const generateTokensWithFunctions = (
  name: string = '',
  tokens?: Array<Array<{ token: IRedisCommand; arguments: IRedisCommand[] }>>,
): {
  [name: string]: languages.IMonarchLanguageRule[]
} => {
  if (!tokens) return {}

  const actualTokens = tokens.filter((tokens) => tokens.length)

  if (!actualTokens.length) return {}

  return {
    [`argument.block.${name}.withFunctions`]: [
      ...actualTokens
        .map((tokens, lvl) => appendTokenWithQuery(tokens, lvl))
        .flat(),
    ],
    ...appendQueryWithNextFunctions(actualTokens.flat()),
  }
}

export const getBlockTokens = (
  name: string = '',
  pureTokens: Maybe<Array<IRedisCommand>[]>,
): languages.IMonarchLanguageRule[] => {
  if (!pureTokens) return []

  const getLeveledToken = (
    tokens: IRedisCommand[],
    lvl: number,
  ): languages.IMonarchLanguageRule[] => {
    const result: languages.IMonarchLanguageRule[] = []
    const restTokens = [...tokens]
    const tokensWithNextExpression = remove(
      restTokens,
      ({ expression }) => expression,
    )

    if (tokensWithNextExpression.length) {
      result.push([
        `(${tokensWithNextExpression.map(({ token }) => sanitizeToken(token)).join('|')})\\b`,
        {
          token: `argument.block.${lvl}.${name}`,
          next: '@query',
        },
      ])
    }

    if (restTokens.length) {
      result.push([
        `(${restTokens.map(({ token }) => sanitizeToken(token)).join('|')})\\b`,
        { token: `argument.block.${lvl}.${name}`, next: '@root' },
      ])
    }

    return result
  }

  return pureTokens.map((tokens, lvl) => getLeveledToken(tokens, lvl)).flat()
}
