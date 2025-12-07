import { Maybe, splitQueryByArgs } from 'uiSrc/utils'
import { MOCKED_REDIS_COMMANDS } from 'uiSrc/mocks/data/mocked_redis_commands'
import { IRedisCommand, ICommandTokenType } from 'uiSrc/constants'
import {
  findSuggestionsByQueryArgs,
  generateDetail,
} from 'uiSrc/pages/workbench/utils/query'
import { commonfindCurrentArgumentCases } from './test-cases'

const ftSearchCommand = MOCKED_REDIS_COMMANDS['FT.SEARCH']
const ftAggregateCommand = MOCKED_REDIS_COMMANDS['FT.AGGREGATE']
const COMMANDS = Object.keys(MOCKED_REDIS_COMMANDS).map((name) => ({
  name,
  ...MOCKED_REDIS_COMMANDS[name],
}))
const COMPOSITE_ARGS = COMMANDS.filter(
  (command) => command.name && command.name.includes(' '),
).map(({ name }) => name)

describe('findSuggestionsByQueryArgs', () => {
  describe('with list of commands', () => {
    commonfindCurrentArgumentCases.forEach(
      ({ input, result, appendIncludes, appendNotIncludes }) => {
        it(`should return proper suggestions for ${input}`, () => {
          const { args } = splitQueryByArgs(
            input,
            0,
            COMPOSITE_ARGS.concat('LOAD *'),
          )
          const COMMANDS_LIST = COMMANDS.map((command) => ({
            ...command,
            token: command.name!,
            type: ICommandTokenType.Block,
          }))

          const testResult = findSuggestionsByQueryArgs(
            COMMANDS_LIST,
            args.flat(),
          )
          expect(result.stopArg ? testResult?.stopArg : undefined).toEqual(
            result.stopArg,
          )
          expect(testResult?.append?.flat()?.map((arg) => arg.token)).toEqual(
            expect.arrayContaining(appendIncludes),
          )

          if (appendNotIncludes) {
            appendNotIncludes.forEach((token) => {
              expect(
                testResult?.append?.flat()?.map((arg) => arg.token),
              ).not.toEqual(expect.arrayContaining([token]))
            })
          }
        })
      },
    )
  })
})

const generateDetailTests: Array<{ input: Maybe<IRedisCommand>; result: any }> =
  [
    {
      input: ftSearchCommand.arguments.find(
        ({ name }) => name === 'nocontent',
      ) as IRedisCommand,
      result: 'NOCONTENT',
    },
    {
      input: ftSearchCommand.arguments.find(
        ({ name }) => name === 'filter',
      ) as IRedisCommand,
      result: 'FILTER numeric_field min max',
    },
    {
      input: ftSearchCommand.arguments.find(
        ({ name }) => name === 'geo_filter',
      ) as IRedisCommand,
      result: 'GEOFILTER geo_field lon lat radius m | km | mi | ft',
    },
    {
      input: ftAggregateCommand.arguments.find(
        ({ name }) => name === 'groupby',
      ) as IRedisCommand,
      result:
        'GROUPBY nargs property [property ...] [REDUCE function nargs arg [arg ...] [AS name] [REDUCE function nargs arg [arg ...] [AS name] ...]]',
    },
  ]

describe('generateDetail', () => {
  it.each(generateDetailTests)(
    'should return for %input proper result',
    ({ input, result }) => {
      const testResult = generateDetail(input)
      expect(testResult).toEqual(result)
    },
  )
})
