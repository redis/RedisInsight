/* eslint-disable no-continue */
import { findLastIndex, isNumber, toNumber } from 'lodash'
import {
  CommandProvider,
  ICommandTokenType,
  IRedisCommand,
  IRedisCommandTree,
} from 'uiSrc/constants'
import { generateArgsNames, Maybe, Nullable } from 'uiSrc/utils'
import { ArgName, FoundCommandArgument } from 'uiSrc/pages/workbench/types'
import {
  isBlockType,
  isStringsEqual,
  isOneOfType,
  isPureToken,
  isArgInOneOf,
} from './helpers'

interface BlockTokensTree {
  queryArgs: string[]
  command?: IRedisCommand
  currentArg?: IRedisCommand
  parent?: BlockTokensTree
}

export const findSuggestionsByQueryArgs = (
  commands: IRedisCommand[],
  queryArgs: string[],
): Nullable<FoundCommandArgument> => {
  const firstQueryArg = queryArgs[0]
  const scopeCommand = firstQueryArg
    ? commands.find((command) => isStringsEqual(command.token, firstQueryArg))
    : undefined

  const nextArgs = queryArgs.slice(scopeCommand ? 1 : 0)
  const blockToken: BlockTokensTree = {
    queryArgs: nextArgs,
    command: scopeCommand,
  }

  return findStopArgumentWithSuggestions(blockToken)
}

const skipOptionalArguments = (
  queryArg: string,
  commandIndex: number,
  commandArguments: IRedisCommand[],
  withLastMandatory = false,
): {
  currentArgument: Maybe<IRedisCommand>
  optionalArguments: IRedisCommand[]
  index: number
} => {
  const optionalArguments = []
  let index = commandIndex + 1
  let currentArgument = commandArguments[index]
  while (index < commandArguments.length) {
    const argumentToken =
      currentArgument.token || currentArgument.arguments?.[0]?.token
    const isOptionalWithInput = isStringsEqual(queryArg, argumentToken)

    if (isOptionalWithInput || (currentArgument && !currentArgument.optional)) {
      return {
        optionalArguments: withLastMandatory
          ? [...optionalArguments, currentArgument]
          : optionalArguments,
        currentArgument,
        index,
      }
    }

    optionalArguments.push(currentArgument)
    index++
    currentArgument = commandArguments[index]
  }

  return { optionalArguments, currentArgument, index }
}

const isCountArg = (arg?: Nullable<IRedisCommand>) =>
  arg?.name === ArgName.NArgs || arg?.name === ArgName.Count
const isCountPositive = (count?: Maybe<number>) => isNumber(count) && count > 0
export const findStopArgument = (
  queryArgs: string[],
  command?: IRedisCommandTree,
  count?: Maybe<number>,
  forceReturn = false,
  parentSkippedArguments: IRedisCommand[][] = [],
) => {
  let commandIndex = 0
  let isBlocked = true
  let argsCount = count

  if (!command?.arguments) return null

  for (let i = 0; i < queryArgs.length; i++) {
    const queryArg = queryArgs[i]
    let currentArgument: Maybe<IRedisCommand> = command?.arguments[commandIndex]
    const prevMandatoryIndex = findLastIndex(
      command.arguments.slice(0, commandIndex),
      (arg) => !arg.optional,
    )

    // handle optional arguments, iterate until we get token or non optional arguments
    // we check if we not blocked on optional token argument
    if (!isBlocked && (currentArgument?.optional || !forceReturn)) {
      const arg = skipOptionalArguments(
        queryArg,
        prevMandatoryIndex,
        command.arguments,
      )
      const { index, currentArgument: nextCurrentArgument } = arg

      currentArgument = nextCurrentArgument
      commandIndex = index
    }

    // handle case when we proceed all arguments from command but it is multiple and should return to 0 index
    if (!currentArgument && isCountPositive(argsCount)) {
      commandIndex = 0
      currentArgument = command?.arguments[commandIndex]
    }

    if (!currentArgument && forceReturn) {
      const arg = skipOptionalArguments(
        queryArg,
        prevMandatoryIndex,
        command.arguments,
      )
      const { optionalArguments: allRestArguments } = skipOptionalArguments(
        '',
        prevMandatoryIndex,
        command.arguments,
      )
      const { index, currentArgument: nextCurrentArgument } = arg
      const restOptional = removeSuggestedArgs(queryArgs, allRestArguments)

      if (!nextCurrentArgument) {
        return {
          queryArgsIterated: i,
          stopArgument: currentArgument,
          skippedArguments: allRestArguments,
          isCompleteByNArgs: argsCount === 0,
        }
      }

      // Continue iterating through optional arguments
      currentArgument = nextCurrentArgument

      if (restOptional?.length) {
        commandIndex = index
      }
    }

    // check count to understand that we in block nargs scope, if completed all arguments then return
    if (isCountPositive(count) && argsCount === 0) {
      return {
        queryArgsIterated: i,
        stopArgument: currentArgument,
        skippedArguments: parentSkippedArguments,
        isBlocked: false,
        isCompleteByNArgs: true,
      }
    }

    // handle pure token, if arg equals, then move to next command
    if (isPureToken(currentArgument, queryArg)) {
      isBlocked = false
      commandIndex++
      isNumber(argsCount) && argsCount--
      continue
    }

    // handle first iteration of token, if arg equals - stay on it and move on to check itself
    if (currentArgument?.token) {
      if (isStringsEqual(queryArg, currentArgument.token)) {
        isBlocked = true
        continue
      }

      if (isBlocked) isBlocked = false

      // token can be on block type
      if (!isBlockType(currentArgument) && !isCountArg(currentArgument)) {
        commandIndex++
        isNumber(argsCount) && argsCount--
        continue
      }
    }

    // handle block, we call the same function for block arguments
    if (isBlockType(currentArgument)) {
      const { optionalArguments } = skipOptionalArguments(
        '',
        prevMandatoryIndex,
        command.arguments,
      )
      const filteredArguments = removeSuggestedArgs(
        queryArgs,
        optionalArguments,
      )
      const parentArgs = [filteredArguments, ...parentSkippedArguments]
      const restQeuryArgs = queryArgs.slice(i)
      const blockResult: any =
        findStopArgument(
          restQeuryArgs,
          currentArgument,
          argsCount,
          true,
          parentArgs,
        ) || {}
      const {
        stopArgument,
        isCompleteByNArgs,
        queryArgsIterated,
        lastArgument,
        skippedArguments,
      } = blockResult

      const isCountCompleted = isCountPositive(argsCount) && isCompleteByNArgs
      i += (queryArgsIterated || 1) - 1

      // entered all multiple counted arguments, move to next command arg
      if (isCountCompleted) {
        argsCount = undefined
        isBlocked = false
        commandIndex++
        continue
      }

      // we found an argument which is needed to be inserted
      if (stopArgument) {
        return {
          ...blockResult,
          blockParent: currentArgument,
        }
      }

      if (lastArgument?.optional && skippedArguments?.[0]?.length) {
        return {
          ...blockResult,
        }
      }

      if (currentArgument && !currentArgument.multiple) commandIndex++

      isBlocked = false
      argsCount = undefined
      continue
    }

    // handle one-of argument
    if (isOneOfType(currentArgument)) {
      const isArgOneOf = isArgInOneOf(currentArgument, queryArg)
      if (isArgOneOf) {
        commandIndex++
        isNumber(argsCount) && argsCount--
        isBlocked = false
        continue
      }

      isBlocked = true
    }

    // handle multiple arguments, argsCount - number of arguments which have to be inserted
    if (currentArgument?.multiple) {
      isNumber(argsCount) && argsCount--

      if (argsCount === 0) {
        commandIndex++
        isBlocked = false
      }

      continue
    }

    // handle count argument with next multiple
    const nextArgument = command?.arguments?.[commandIndex + 1]
    if (isCountArg(currentArgument) && nextArgument?.multiple) {
      argsCount = toNumber(queryArg) || 0

      if (argsCount === 0) {
        // skip next argument
        commandIndex += 2
        continue
      }

      commandIndex++
      isBlocked = true
      continue
    }

    commandIndex++
    isNumber(argsCount) && argsCount--

    if (isCountPositive(argsCount)) {
      continue
    }

    isBlocked = false
  }

  const stopArgument: Maybe<IRedisCommand> = command?.arguments?.[commandIndex]
  const prevMandatoryIndex = findLastIndex(
    command.arguments.slice(0, commandIndex),
    (arg) => !arg.optional,
  )

  const data = skipOptionalArguments(
    '',
    prevMandatoryIndex,
    command.arguments,
    true,
  )
  const currentLvlArgs = removeSuggestedArgs(queryArgs, data.optionalArguments)

  return {
    skippedArguments:
      stopArgument && !stopArgument.optional
        ? [currentLvlArgs]
        : [currentLvlArgs, ...parentSkippedArguments],
    lastArgument: command?.arguments?.[commandIndex - 1],
    stopArgument,
    isBlocked,
    queryArgsIterated: queryArgs.length,
    isCompleteByNArgs: argsCount === 0,
  }
}

export const findStopArgumentWithSuggestions = (
  currentBlock: BlockTokensTree,
): Nullable<FoundCommandArgument> => {
  const { queryArgs, command } = currentBlock
  const { isBlocked, stopArgument, skippedArguments, blockParent } =
    findStopArgument(queryArgs, command)

  if (isBlocked) {
    const isBlockedWithSuggestions =
      stopArgument.type === ICommandTokenType.OneOf

    return {
      stopArg: stopArgument,
      append: [
        fillArgsByType(
          isBlockedWithSuggestions
            ? stopArgument.arguments
            : [stopArgument.arguments?.[0]] || [stopArgument],
        ),
      ],
      isBlocked: !isBlockedWithSuggestions,
      parent: blockParent || command,
    }
  }

  const append = skippedArguments.map((args: IRedisCommand[]) =>
    fillArgsByType(args, true),
  )

  return {
    append,
    stopArg: stopArgument,
    isBlocked,
    parent: blockParent || command,
  }
}

export const removeSuggestedArgs = (
  args: string[],
  commandArgs: IRedisCommandTree[],
) =>
  commandArgs.filter((arg) => {
    if (arg.token && arg.multiple) return true

    if (arg.type === ICommandTokenType.OneOf) {
      return !args.some((queryArg) =>
        arg.arguments?.some((oneOfArg) =>
          isStringsEqual(oneOfArg.token, queryArg),
        ),
      )
    }

    if (arg.type === ICommandTokenType.Block) {
      if (arg.token) return !args.includes(arg.token) || arg.multiple
      return (
        arg.arguments?.[0]?.token &&
        (!args.includes(arg.arguments?.[0]?.token?.toUpperCase()) ||
          arg.multiple)
      )
    }

    return arg.token && !args.includes(arg.token)
  })

export const fillArgsByType = (
  args: IRedisCommand[],
  expandBlock = true,
): IRedisCommandTree[] => {
  const result: IRedisCommandTree[] = []

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i]

    if (
      expandBlock &&
      currentArg?.type === ICommandTokenType.OneOf &&
      !currentArg?.token
    ) {
      result.push(
        ...(currentArg?.arguments?.map((arg) => ({
          ...arg,
          parent: currentArg,
        })) || []),
      )
    }

    if (currentArg?.token) {
      result.push(currentArg)
      continue
    }

    if (currentArg?.type === ICommandTokenType.Block) {
      result.push({
        multiple: currentArg.multiple,
        optional: currentArg.optional,
        parent: currentArg,
        ...((currentArg?.arguments?.[0] as IRedisCommand) || {}),
      })
    }
  }

  return result
}

export const generateDetail = (command: Maybe<IRedisCommand>) => {
  if (!command) return ''
  if (command.arguments) {
    const isTokenInArguemnts = command.token === command.arguments?.[0]?.token
    const args = generateArgsNames(
      CommandProvider.Main,
      command.arguments.slice(isTokenInArguemnts ? 1 : 0),
    ).join(' ')
    return command.token ? `${command.token} ${args}` : args
  }
  if (command.token) {
    if (command.type === ICommandTokenType.PureToken) return command.token
    return `${command.token}`
  }

  return ''
}
