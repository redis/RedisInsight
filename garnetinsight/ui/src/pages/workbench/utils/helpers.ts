import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'

export const isStringsEqual = (str1?: string, str2?: string) =>
  str1?.toLowerCase() === str2?.toLowerCase()
export const isPureTokenType = (command?: IRedisCommand) =>
  command?.type === ICommandTokenType.PureToken
export const isBlockType = (command?: IRedisCommand) =>
  command?.type === ICommandTokenType.Block
export const isOneOfType = (command?: IRedisCommand) =>
  command?.type === ICommandTokenType.OneOf

export const isPureToken = (command?: IRedisCommand, arg?: string) =>
  isPureTokenType(command) && isStringsEqual(arg, command?.token)

export const isArgInOneOf = (command?: IRedisCommand, arg?: string) =>
  command?.arguments?.some(({ token }) => isStringsEqual(arg, token))
