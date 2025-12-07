import { ProfileQueryType, SEARCH_COMMANDS, GRAPH_COMMANDS } from '../constants'

export const generateGraphProfileQuery = (
  query: string,
  type: ProfileQueryType,
) => {
  const q = query?.split(' ')?.slice(1)

  if (q) {
    return [`graph.${type.toLowerCase()}`, ...q].join(' ')
  }

  return null
}

export const generateSearchProfileQuery = (
  query: string,
  type: ProfileQueryType,
) => {
  const commandSplit = query?.split(' ')
  const cmd = commandSplit?.[0]

  if (!commandSplit || !cmd) {
    return null
  }

  if (type === ProfileQueryType.Explain) {
    return [`ft.${type.toLowerCase()}`, ...commandSplit?.slice(1)].join(' ')
  }
  const index = commandSplit?.[1]

  const queryType = cmd.split('.')?.[1] // SEARCH / AGGREGATE
  return [
    `ft.${type.toLowerCase()}`,
    index,
    queryType,
    'QUERY',
    ...commandSplit?.slice(2),
  ].join(' ')
}

export const generateProfileQueryForCommand = (
  query: string,
  type: ProfileQueryType,
) => {
  const cmd = query?.split(' ')?.[0]?.toLowerCase()

  if (GRAPH_COMMANDS.includes(cmd)) {
    return generateGraphProfileQuery(query, type)
  }
  if (SEARCH_COMMANDS.includes(cmd)) {
    return generateSearchProfileQuery(query, type)
  }

  return null
}
