import {
  getDbIndexFromSelectQuery,
  getCommandNameFromQuery,
  cliParseCommandsGroupResult,
  CliPrefix,
  wbSummaryCommand,
  checkUnsupportedModuleCommand,
  checkCommandModule,
  checkUnsupportedCommand,
  checkBlockingCommand,
  replaceEmptyValue,
  removeDeprecatedModuleCommands,
  checkDeprecatedModuleCommand,
  checkDeprecatedCommandGroup,
  getUnsupportedModulesFromQuery,
} from 'uiSrc/utils'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { render, screen } from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

const getDbIndexFromSelectQueryTests = [
  { input: 'select 0', expected: 0 },
  { input: 'select 1', expected: 1 },
  { input: 'SELECT 10', expected: 10 },
  { input: 'SeLeCt 10', expected: 10 },
  { input: 'select "1"', expected: 1 },
  { input: '   select "1"   ', expected: 1 },
  { input: "select '1'", expected: 1 },
  { input: "select '1'", expected: 1 },
  { input: 'info', expected: new Error('Invalid command') },
  { input: 'select "1 1231"', expected: new Error('Parsing error') },
  { input: 'select abc', expected: new Error('Parsing error') },
  { input: 'select ', expected: new Error('Parsing error') },
]

const replaceEmptyValueTests = [
  { input: '', expected: '(nil)' },
  { input: undefined, expected: '(nil)' },
  { input: false, expected: '(nil)' },
  { input: 'string', expected: 'string' },
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: [], expected: [] },
  { input: {}, expected: {} },
]

describe('replaceEmptyValue', () => {
  test.each(replaceEmptyValueTests)('%j', ({ input, expected }) => {
    expect(replaceEmptyValue(input)).toEqual(expected)
  })
})

describe('getDbIndexFromSelectQuery', () => {
  test.each(getDbIndexFromSelectQueryTests)('%j', ({ input, expected }) => {
    if (expected instanceof Error) {
      try {
        getDbIndexFromSelectQuery(input)
      } catch (e) {
        expect(e.message).toEqual(expected.message)
      }
    } else {
      expect(getDbIndexFromSelectQuery(input)).toEqual(expected)
    }
  })
})

const getCommandNameFromQueryTests = [
  { input: ['set foo bar', MOCK_COMMANDS_SPEC], expected: 'set' },
  { input: ['  SET       foo bar', MOCK_COMMANDS_SPEC], expected: 'SET' },
  { input: ['client kill 1', MOCK_COMMANDS_SPEC], expected: 'client kill' },
  { input: ['client kill 1', {}], expected: 'client' },
  {
    input: ['custom.command foo bar', MOCK_COMMANDS_SPEC],
    expected: 'custom.command',
  },
  { input: ['FT._LIST', MOCK_COMMANDS_SPEC], expected: 'FT._LIST' },
  {
    input: [
      `${' '.repeat(20)} CLIENT ${' '.repeat(100)} KILL`,
      MOCK_COMMANDS_SPEC,
    ],
    expected: 'CLIENT',
  },
  {
    input: [
      `${' '.repeat(20)} CLIENT ${' '.repeat(100)} KILL`,
      MOCK_COMMANDS_SPEC,
      500,
    ],
    expected: 'CLIENT KILL',
  },
  { input: [1], expected: undefined },
]

const checkUnsupportedModuleCommandTests = [
  { input: [[], 'FT.foo bar'], expected: RedisDefaultModules.Search },
  {
    input: [[{ name: RedisDefaultModules.Search }], 'foo bar'],
    expected: null,
  },
  {
    input: [[{ name: RedisDefaultModules.Search }], 'ft.foo bar'],
    expected: null,
  },
  {
    input: [[{ name: RedisDefaultModules.SearchLight }], 'ft.foo bar'],
    expected: null,
  },
  {
    input: [[{ name: RedisDefaultModules.FT }], ' FT.foo bar'],
    expected: null,
  },
  {
    input: [[{ name: RedisDefaultModules.FTL }], '  ft.foo bar'],
    expected: null,
  },
]

const checkCommandModuleTests = [
  { input: 'FT.foo bar', expected: RedisDefaultModules.Search },
  { input: 'JSON.foo bar', expected: RedisDefaultModules.ReJSON },
  { input: 'TS.foo bar', expected: RedisDefaultModules.TimeSeries },
  { input: 'BF.foo bar', expected: RedisDefaultModules.Bloom },
  { input: 'CF.foo bar', expected: RedisDefaultModules.Bloom },
  { input: 'CMS.foo bar', expected: RedisDefaultModules.Bloom },
  { input: 'TDIGEST.foo bar', expected: RedisDefaultModules.Bloom },
  { input: 'TOPK.foo bar', expected: RedisDefaultModules.Bloom },
  { input: 'FOO.foo bar', expected: null },
]

const checkUnsupportedCommandTests = [
  { input: [['FT'], 'FT.foo bar'], expected: 'FT' },
  { input: [['FT'], ' ft.foo bar  '], expected: 'FT' },
  { input: [['FOO', 'BAR'], 'FT.foo bar'], expected: undefined },
]

const checkBlockingCommandTests = [
  { input: [['ft'], 'FT.foo bar'], expected: 'ft' },
  { input: [['ft'], ' ft.foo bar  '], expected: 'ft' },
  { input: [['foo', 'bar'], 'FT.foo bar'], expected: undefined },
]

const checkDeprecatedModuleCommandTests = [
  { input: 'FT.foo bar', expected: false },
  { input: 'GRAPH foo bar', expected: false },
  { input: 'GRAPH.foo bar', expected: true },
  { input: 'graph.foo bar', expected: true },
  { input: 'FOO bar', expected: false },
]

const removeDeprecatedModuleCommandsTests = [
  { input: ['FT.foo'], expected: ['FT.foo'] },
  { input: ['GRAPH.foo', 'FT.foo'], expected: ['FT.foo'] },
  {
    input: ['FOO', 'GRAPH.FOO', 'CF.FOO', 'GRAPH.BAR'],
    expected: ['FOO', 'CF.FOO'],
  },
]

const checkDeprecatedCommandGroupTests = [
  { input: 'cluster', expected: false },
  { input: 'connection', expected: false },
  { input: 'geo', expected: false },
  { input: 'bitmap', expected: false },
  { input: 'generic', expected: false },
  { input: 'pubsub', expected: false },
  { input: 'scripting', expected: false },
  { input: 'transactions', expected: false },
  { input: 'server', expected: false },
  { input: 'sorted-set', expected: false },
  { input: 'hyperloglog', expected: false },
  { input: 'hash', expected: false },
  { input: 'set', expected: false },
  { input: 'stream', expected: false },
  { input: 'list', expected: false },
  { input: 'string', expected: false },
  { input: 'search', expected: false },
  { input: 'json', expected: false },
  { input: 'timeseries', expected: false },
  { input: 'graph', expected: true },
  { input: 'ai', expected: false },
  { input: 'tdigest', expected: false },
  { input: 'cms', expected: false },
  { input: 'topk', expected: false },
  { input: 'bf', expected: false },
  { input: 'cf', expected: false },
]

const getUnsupportedModulesFromQueryTests: Array<{
  input: [Array<any>, string]
  expected: Set<string>
}> = [
  { input: [[], 'ft.info'], expected: new Set(['search']) },
  { input: [[], 'bf.info'], expected: new Set(['bf']) },
  { input: [[], 'bf.info \nJSON.GET'], expected: new Set(['ReJSON', 'bf']) },
  { input: [[{ name: 'search' }], 'ft.info'], expected: new Set([]) },
]

describe('getCommandNameFromQuery', () => {
  test.each(getCommandNameFromQueryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(getCommandNameFromQuery(...input)).toEqual(expected)
  })
})

describe('cliParseCommandsGroupResult success status', () => {
  const mockResult = {
    command: 'command',
    response: 'response',
    status: CommandExecutionStatus.Success,
  }
  const parsedResult = cliParseCommandsGroupResult(mockResult)
  render(parsedResult)

  expect(screen.queryByTestId('wb-command')).toBeInTheDocument()
  expect(screen.getByText('> command')).toBeInTheDocument()
  expect(
    screen.queryByTestId(`${CliPrefix.Cli}-output-response-fail`),
  ).not.toBeInTheDocument()
  expect(parsedResult[1]).toEqual('"response"')
})

describe('cliParseCommandsGroupResult error status', () => {
  const mockResult = {
    command: 'command',
    response: 'response',
    status: CommandExecutionStatus.Fail,
  }
  render(cliParseCommandsGroupResult(mockResult))

  expect(
    screen.queryByTestId(`${CliPrefix.Cli}-output-response-fail`),
  ).toBeInTheDocument()
})

const wbSummaryCommandTests: any[] = [
  ['SET', 0, '> SET'],
  ['iueigc h pb32 ueo', 0, '> iueigc h pb32 ueo'],
  ['SET', 1, '[db1] > SET'],
  ['INFO', 10, '[db10] > INFO'],
  ['aoeuaoeu', 10, '[db10] > aoeuaoeu'],
]

describe('wbSummaryCommand', () => {
  it.each(wbSummaryCommandTests)(
    'for input: %s (command), should be output: %s',
    (command, db, expected) => {
      const { container } = render(wbSummaryCommand(command, db))
      expect(container).toHaveTextContent(expected)
    },
  )
})

describe('checkUnsupportedModuleCommand', () => {
  test.each(checkUnsupportedModuleCommandTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(checkUnsupportedModuleCommand(...input)).toEqual(expected)
  })
})

describe('checkCommandModule', () => {
  test.each(checkCommandModuleTests)('%j', ({ input, expected }) => {
    expect(checkCommandModule(input)).toEqual(expected)
  })
})

describe('checkUnsupportedCommand', () => {
  test.each(checkUnsupportedCommandTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(checkUnsupportedCommand(...input)).toEqual(expected)
  })
})

describe('checkBlockingCommand', () => {
  test.each(checkBlockingCommandTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(checkBlockingCommand(...input)).toEqual(expected)
  })
})

describe('checkDeprecatedModuleCommand', () => {
  test.each(checkDeprecatedModuleCommandTests)('%j', ({ input, expected }) => {
    expect(checkDeprecatedModuleCommand(input)).toEqual(expected)
  })
})

describe('removeDeprecatedModuleCommands', () => {
  test.each(removeDeprecatedModuleCommandsTests)(
    '%j',
    ({ input, expected }) => {
      expect(removeDeprecatedModuleCommands(input)).toEqual(expected)
    },
  )
})

describe('checkDeprecatedCommandGroup', () => {
  test.each(checkDeprecatedCommandGroupTests)('%j', ({ input, expected }) => {
    expect(checkDeprecatedCommandGroup(input)).toEqual(expected)
  })
})

describe('getUnsupportedModulesFromQuery', () => {
  test.each(getUnsupportedModulesFromQueryTests)(
    '%j',
    ({ input, expected }) => {
      expect(getUnsupportedModulesFromQuery(...input)).toEqual(expected)
    },
  )
})
