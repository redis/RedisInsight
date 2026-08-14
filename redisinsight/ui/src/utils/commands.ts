import {
  flatten,
  isArray,
  isEmpty,
  isNumber,
  reject,
  toNumber,
  isNaN,
  isInteger,
  isString,
  forEach,
} from 'lodash'
import {
  CommandArgsType,
  CommandProvider,
  ICommand,
  ICommandArg,
  ICommandArgGenerated,
} from 'uiSrc/constants'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import i18n from 'uiSrc/i18n'

const ARG_TYPE_KEYS = {
  multiple: 'common.command.argType.multiple',
  optional: 'common.command.argType.optional',
  required: 'common.command.argType.required',
} as const

enum ArgumentType {
  INTEGER = 'integer',
  DOUBLE = 'double',
  STRING = 'string',
  UNIX_TIME = 'unix-time',
  PATTERN = 'pattern',
  KEY = 'key',
  ONEOF = 'oneof',
  BLOCK = 'block',
  PURE_TOKEN = 'pure-token',
  COMMAND = 'command',
  ENUM = 'enum', // temporary for backward compatibility
}

export class Argument {
  protected stack = []

  protected name: string

  protected type: ArgumentType

  protected optional: boolean

  protected multiple: boolean

  protected multipleToken: boolean

  protected token: string | null

  protected display: string

  protected arguments: Argument[]

  protected enum: string[]

  constructor(data: Record<string, any>) {
    this.stack = []
    this.name = data?.name
    this.type = data?.type
    this.optional = !!data?.optional
    this.multiple = !!data?.multiple
    this.multipleToken = !!data?.multiple_token
    this.token = data?.token
    this.display = data?.display_text || data?.command || this.name
    this.enum = data?.enum
    // todo: why we need this?
    if (this.token === '') {
      this.token = '""'
    }
    this.arguments = (
      (data?.arguments || data?.block || []) as Record<string, any>[]
    ).map((childArg) => new Argument(childArg))
  }

  public syntax(opts: Record<string, any> = {}): string {
    const showTypes = !!opts?.showTypes
    const pureName = !!opts?.pureName
    const onlyMandatory = !!opts?.onlyMandatory

    if (onlyMandatory && this.optional) {
      return ''
    }

    let args = ''

    switch (this.type) {
      case ArgumentType.BLOCK:
        args += this.arguments.map((arg) => arg.syntax()).join(' ')
        break
      case ArgumentType.ONEOF:
        args += this.arguments.map((arg) => arg.syntax()).join(' | ')
        break
      case ArgumentType.ENUM:
        args += this.enum?.join(' | ')
        break
      case ArgumentType.PURE_TOKEN:
        break
      default:
        args += this.display
        if (showTypes) {
          args += `:${this.type}`
        }
    }

    let syntax = ''

    if (this.token) {
      syntax += this.token
      if (this.type !== ArgumentType.PURE_TOKEN) {
        syntax += ' '
      }
    }

    let multipleSyntax = ''
    if (this.multiple && !pureName) {
      if (this.multipleToken) {
        multipleSyntax += `${args} [${this.token} ${args} ...]`
      } else {
        multipleSyntax += `${args} [${args} ...]`
      }
    } else {
      multipleSyntax += args
    }

    // if (this.type === ArgumentType.ONEOF && (!this.optional || this.token)) {
    //   multipleSyntax = `<${multipleSyntax}>`
    // }

    syntax += multipleSyntax

    if (this.optional) {
      syntax = `[${syntax}]`
    }

    return syntax
  }
}

export const getComplexityShortNotation = (
  complexity: string[] | string,
): string => {
  const value = isArray(complexity) ? complexity.join(' ') : complexity
  return value.endsWith(')') && value.startsWith('O') ? value : ''
}

const generateArgName = (
  provider: string,
  arg: ICommandArg,
  pureName: boolean = false,
  onlyMandatory: boolean = false,
): string | string[] => {
  try {
    // todo: temporary workaround until all commands providers will be unified
    if ([CommandProvider.Main].includes(<CommandProvider.Main>provider)) {
      return new Argument(arg).syntax({
        onlyMandatory,
        pureName,
      })
    }

    // We need this for backward compatibility now
    const {
      name: propName = '',
      enum: enumArg,
      command,
      optional,
      multiple,
      type,
      block,
    } = arg

    if (onlyMandatory && optional) return ''

    const name = isArray(propName) ? propName?.join(' ') : propName
    const enumName = enumArg && (!pureName || !name) ? enumArg?.join('|') : name
    const commandName = command
      ? command + (enumName ? ` ${enumName}` : '')
      : enumName
    const optionalName = optional ? `[${commandName}]` : commandName

    const multipleNameTemp = [
      ...commandName?.split?.(' '),
      `[${commandName} ...]`,
    ]
    const multipleName = optional
      ? `[${multipleNameTemp.join(' ')}]`
      : multipleNameTemp

    if (type === CommandArgsType.Block && isArray(block)) {
      const blocks = flatten(
        block?.map?.((block) =>
          generateArgName(provider, block, pureName, onlyMandatory),
        ),
      )
      return optional ? `[${blocks?.join?.(' ')}]` : blocks
    }

    return (
      (multiple && !pureName && !onlyMandatory ? multipleName : optionalName) ??
      ''
    )
  } catch (e) {
    return ''
  }
}

export const generateArgs = (
  provider = 'unknown',
  args: ICommandArg[],
): ICommandArgGenerated[] =>
  flatten(
    args.map((arg) => ({
      ...arg,
      generatedName: generateArgName(provider, arg, true),
    })),
  )

export const generateArgsNames = (
  provider: string = 'unknown',
  args: ICommandArg[],
  pureName: boolean = false,
  onlyMandatory: boolean = false,
): string[] =>
  reject(
    flatten(
      args.map((arg) =>
        generateArgName(provider, arg, pureName, onlyMandatory),
      ),
    ),
    isEmpty,
  )

export const generateArgsForInsertText = (
  argsNames: string[],
  separator: string = ' ',
): string =>
  `${
    !argsNames.length
      ? ''
      : argsNames
          .join(' ')
          .split(' ')
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          .map(
            (arg: string, i: number) =>
              `\${${i + 1}:${arg}}${argsNames.length !== i + 1 ? separator : ''}`,
          )
          .join('')
  }`

export const getDocUrlForCommand = (commandName: string): string => {
  const command = commandName.replace(/\s+/g, '-').toLowerCase()
  return getUtmExternalLink(
    `https://redis.io/docs/latest/commands/${command}`,
    {
      campaign: 'redisinsight_command_helper',
    },
  )
}

export const getCommandRepeat = (command = ''): [string, number] => {
  const [countRepeatStr = '', ...restCommand] = command?.split?.(' ')
  let countRepeat = toNumber(countRepeatStr)
  let commandLine = restCommand.join(' ')
  if (!isNumber(countRepeat) || isNaN(countRepeat) || !command) {
    countRepeat = 1
    commandLine = command
  }

  return [commandLine, countRepeat]
}

export const isRepeatCountCorrect = (number: number): boolean =>
  number >= 1 && isInteger(number)

type RedisArg = string | number | Array<RedisArg>
export const generateRedisCommand = (
  command: string,
  ...rest: Array<RedisArg>
) => {
  let commandToSend = command

  forEach(rest, (arg: RedisArg) => {
    if ((isString(arg) && arg) || isNumber(arg)) {
      commandToSend += ` "${arg}"`
    }
    if (isArray(arg)) {
      commandToSend += generateRedisCommand('', ...arg)
    }
  })

  return commandToSend.replace(/\s\s+/g, ' ')
}

export const arrayCommandToString = (command: string[] | null) => {
  if (isArray(command)) {
    return command
      .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
      .join(' ')
  }

  return null
}

export const getCommandMarkdown = (
  command: ICommand,
  docUrl: string = '',
): string => {
  const linkMore = !docUrl
    ? ''
    : ` [${i18n.t('common.command.readMore')}](${docUrl})`
  const lines: string[] = [command?.summary + linkMore]
  if (command?.arguments?.length) {
    lines.push(`### ${i18n.t('common.command.argumentsHeading')}`)
    generateArgs(command?.provider, command.arguments).forEach(
      (arg: ICommandArgGenerated): void => {
        const { multiple, optional } = arg
        const typeKey = multiple
          ? ARG_TYPE_KEYS.multiple
          : optional
            ? ARG_TYPE_KEYS.optional
            : ARG_TYPE_KEYS.required
        const argDescription: string = `_${i18n.t(typeKey)}_ \`${arg.generatedName}\``
        lines.push(argDescription)
      },
    )
  }
  return lines.join('\n'.repeat(2))
}
