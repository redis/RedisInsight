import { ICommandTokenType, IRedisCommand } from 'uiSrc/constants'

const hasUnixTimeArg = (args?: IRedisCommand[]): boolean => {
  if (!args?.length) {
    return false
  }

  return args.some(
    (arg) =>
      arg.type === ICommandTokenType.UnixTime || hasUnixTimeArg(arg.arguments),
  )
}

export const commandHasUnixTimeArgs = (
  commands: IRedisCommand[],
  query: string,
): boolean => {
  if (!query.trim()) {
    return false
  }

  const parts = query.trim().split(/\s+/)
  const firstWord = parts[0]?.toUpperCase()

  if (!firstWord) {
    return false
  }

  // Handle sub-commands like "TS.RANGE", "TS.MRANGE"
  // Also try two-word commands like "CLIENT GETNAME"
  const twoWord =
    parts.length > 1 ? `${firstWord} ${parts[1]?.toUpperCase()}` : ''

  const command = commands.find((cmd) => {
    const token = cmd.token?.toUpperCase()
    return token === firstWord || token === twoWord
  })

  if (!command) {
    return false
  }

  return hasUnixTimeArg(command.arguments)
}
