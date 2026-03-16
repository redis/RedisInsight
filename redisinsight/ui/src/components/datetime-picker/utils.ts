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

const lineCommandHasUnixTimeArgs = (
  commands: IRedisCommand[],
  line: string,
): boolean => {
  const trimmed = line.trim()
  if (!trimmed) {
    return false
  }

  const parts = trimmed.split(/\s+/)
  const firstWord = parts[0]?.toUpperCase()
  if (!firstWord) {
    return false
  }

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

/**
 * Returns true if the query contains at least one command that has unix-time
 * arguments. Splits the query by newlines so that multi-line workbench input
 * (e.g. "GET key\nEXPIREAT mykey") is evaluated per line; the cursor-aware
 * check (currentArgIsUnixTime) then controls visibility at the argument level.
 */
export const commandHasUnixTimeArgs = (
  commands: IRedisCommand[],
  query: string,
): boolean => {
  if (!query.trim()) {
    return false
  }

  const lines = query.split(/\n/)
  return lines.some((line) => lineCommandHasUnixTimeArgs(commands, line))
}
