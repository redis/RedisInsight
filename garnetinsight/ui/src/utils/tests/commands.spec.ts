import {
  ICommandArgGenerated,
  ICommands,
  MOCK_COMMANDS_SPEC,
} from 'uiSrc/constants'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import {
  generateArgs,
  generateArgsNames,
  getComplexityShortNotation,
  getDocUrlForCommand,
  generateRedisCommand,
} from '../commands'
import { cleanup } from '../test-utils'

const ALL_REDIS_COMMANDS: ICommands = MOCK_COMMANDS_SPEC

interface IMockedCommands {
  matchedCommand: string
  argStr?: string
  argsNamesWithEnumsMock?: string[]
  argsNamesMock?: (string | string[])[]
  complexityShortMock?: string
}

beforeEach(() => {
  cleanup()
})

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'xgroup',
    argStr: 'XGROUP',
    argsNamesWithEnumsMock: [],
    argsNamesMock: [],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'hset',
    argStr: 'HSET key field value [field value ...]',
    argsNamesWithEnumsMock: ['key', 'field value [field value ...]'],
    argsNamesMock: ['key', 'field value'],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'acl setuser',
    argStr: 'ACL SETUSER username [rule [rule ...]]',
    argsNamesWithEnumsMock: ['username', '[rule [rule ...]]'],
    argsNamesMock: ['username', '[rule]'],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'bitfield',
    argStr:
      'BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]',
    argsNamesWithEnumsMock: [
      'key',
      '[GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment [GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment ...]]',
    ],
    argsNamesMock: [
      'key',
      '[GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment]',
    ],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'client kill',
    argStr:
      'CLIENT KILL [ip:port] [ID client-id] [TYPE normal|master|slave|pubsub] [USER username] [ADDR ip:port] [LADDR ip:port] [SKIPME yes/no]',
    argsNamesWithEnumsMock: [
      'ip:port | [ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] [[ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] ...]',
    ],
    argsNamesMock: [
      'ip:port | [ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] [[ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] ...]',
    ],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'geoadd',
    argStr:
      'GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX | XX]',
      '[CH]',
      'longitude latitude member [longitude latitude member ...]',
    ],
    argsNamesMock: ['key', '[NX | XX]', '[CH]', 'longitude latitude member'],
    complexityShortMock: 'O(log(N))',
  },
  {
    matchedCommand: 'zadd',
    argStr:
      'ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX | XX]',
      '[GT | LT]',
      '[CH]',
      '[INCR]',
      'score member [score member ...]',
    ],
    argsNamesMock: [
      'key',
      '[NX | XX]',
      '[GT | LT]',
      '[CH]',
      '[INCR]',
      'score member',
    ],
    complexityShortMock: 'O(log(N))',
  },
]

describe('getComplexityShortNotation', () => {
  it('Complexity short should return text according mocked data', () => {
    mockedCommands.forEach(({ matchedCommand = '', complexityShortMock }) => {
      const complexity =
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.complexity ?? ''
      const complexityShort = getComplexityShortNotation(complexity)

      if (complexityShort) {
        expect(complexityShort).toEqual(complexityShortMock)
      } else {
        expect(complexityShort).toEqual('')
      }
    })
  })
  it('handle case when complexity is array of strings', () => {
    const result = getComplexityShortNotation([
      'O(1) for each field/value pair added',
      'O(N) to add N field/value pairs when the command is called with multiple field/value pairs.',
    ])

    expect(result).toEqual('')
  })
})

describe('generateArgs', () => {
  it('generateArgs short should return argument with GeneratedName (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock = [] }) => {
      const argsInit =
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const argsMocked: ICommandArgGenerated[] = argsInit.map((arg, i) => ({
        ...arg,
        generatedName: argsNamesMock[i] ?? '',
      }))

      const args = generateArgs(
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.provider,
        argsInit,
      )

      expect(args).toEqual(argsMocked)
    })
  })
})

describe('generateArgName', () => {
  it('Arguments names should return text according mocked data (with Enums values)', () => {
    mockedCommands.forEach(
      ({ matchedCommand = '', argsNamesWithEnumsMock }) => {
        const args =
          ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

        const generatedArgNames = generateArgsNames(
          ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.provider,
          args,
        )
        expect(generatedArgNames).toEqual(argsNamesWithEnumsMock)
      },
    )
  })
  it('Arguments names should return text according mocked data (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock }) => {
      const args =
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const generatedArgNames = generateArgsNames(
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.provider,
        args,
        true,
      )
      expect(generatedArgNames).toEqual(argsNamesMock)
    })
  })
})

const getDocUrlForCommandTests: any[] = [
  ['SET', 'https://redis.io/docs/latest/commands/set'],
  ['ACL SETUSER', 'https://redis.io/docs/latest/commands/acl-setuser'],
  ['JSON.GET', 'https://redis.io/docs/latest/commands/json.get'],
  ['FT.CREATE', 'https://redis.io/docs/latest/commands/ft.create'],
  ['FT.ALTER', 'https://redis.io/docs/latest/commands/ft.alter'],
  ['TS.ADD', 'https://redis.io/docs/latest/commands/ts.add'],
  ['TS.CREATE', 'https://redis.io/docs/latest/commands/ts.create'],
  ['GRAPH.EXPLAIN', 'https://redis.io/docs/latest/commands/graph.explain'],
  ['GRAPH.QUERY', 'https://redis.io/docs/latest/commands/graph.query'],
  ['BF.INFO', 'https://redis.io/docs/latest/commands/bf.info'],
  ['CMS.INITBYDIM', 'https://redis.io/docs/latest/commands/cms.initbydim'],
  ['CF.INSERT', 'https://redis.io/docs/latest/commands/cf.insert'],
  ['RG.CONFIGSET', 'https://redis.io/docs/latest/commands/rg.configset'],
  ['TOPK.INFO', 'https://redis.io/docs/latest/commands/topk.info'],
  [
    'NON.EXIST COMMAND',
    'https://redis.io/docs/latest/commands/non.exist-command',
  ],
]

describe('getDocUrlForCommand', () => {
  it.each(getDocUrlForCommandTests)(
    'for input: %s (command), should be output: %s',
    (command, expected) => {
      const result = getDocUrlForCommand(command)
      expect(result).toBe(
        getUtmExternalLink(expected, {
          campaign: 'garnetinsight_command_helper',
        }),
      )
    },
  )
})

const generateRedisCommandTests = [
  {
    input: ['info'],
    output: 'info',
  },
  {
    input: ['set', ['a', 'b']],
    output: 'set "a" "b"',
  },
  {
    input: ['set', 'a', 'b'],
    output: 'set "a" "b"',
  },
  {
    input: ['command', ['a', 'b'], ['b', 'b'], 0, 'a', 'a b c'],
    output: 'command "a" "b" "b" "b" "0" "a" "a b c"',
  },
]

describe('generateRedisCommand', () => {
  it.each(generateRedisCommandTests)(
    'for input: %s (input), should be output: %s',
    ({ input, output }) => {
      const result = generateRedisCommand(...input)
      expect(result).toBe(output)
    },
  )
})
