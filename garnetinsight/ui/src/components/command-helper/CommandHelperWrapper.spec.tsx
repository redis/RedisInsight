import { cloneDeep } from 'lodash'
import React from 'react'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { ICommands, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import CommandHelperWrapper from './CommandHelperWrapper'

const ALL_REDIS_COMMANDS: ICommands = MOCK_COMMANDS_SPEC
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'
const cliHelperTestId = 'cli-helper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliSettingsSelector: jest.fn().mockReturnValue({
    matchedCommand: '',
    isSearching: false,
    isEnteringCommand: false,
    searchedCommand: '',
    searchingCommand: '',
  }),
}))

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } =
    jest.requireActual('uiSrc/constants')
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: MOCK_COMMANDS_ARRAY,
    }),
  }
})

interface IMockedCommands {
  matchedCommand: string
  argStr?: string
  argListText?: string
  complexityShort?: string
}

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'xgroup',
    argStr: 'XGROUP',
    argListText: '',
  },
  {
    matchedCommand: 'hset',
    argStr: 'HSET key field value [field value ...]',
    argListText: 'Arguments:RequiredkeyMultiplefield value',
  },
  {
    matchedCommand: 'acl setuser',
    argStr: 'ACL SETUSER username [rule [rule ...]]',
    argListText: 'Arguments:RequiredusernameMultiple[rule]',
  },
  {
    matchedCommand: 'bitfield',
    argStr:
      'BITFIELD key [GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment [GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment ...]]',
    argListText:
      'Arguments:RequiredkeyMultiple[GET encoding offset | [OVERFLOW WRAP | SAT | FAIL] SET encoding offset value | INCRBY encoding offset increment]',
  },
  {
    matchedCommand: 'client kill',
    argStr:
      'CLIENT KILL ip:port | [ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] [[ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] ...]',
    argListText:
      'Arguments:Requiredip:port | [ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] [[ID client-id] | [TYPE NORMAL | MASTER | SLAVE | REPLICA | PUBSUB] | [USER username] | [ADDR ip:port] | [LADDR ip:port] | [SKIPME YES | NO] ...]',
  },
  {
    matchedCommand: 'geoadd',
    argStr:
      'GEOADD key [NX | XX] [CH] longitude latitude member [longitude latitude member ...]',
    argListText:
      'Arguments:RequiredkeyOptional[NX | XX]Optional[CH]Multiplelongitude latitude member',
  },
  {
    matchedCommand: 'zadd',
    argStr:
      'ZADD key [NX | XX] [GT | LT] [CH] [INCR] score member [score member ...]',
    argListText:
      'Arguments:RequiredkeyOptional[NX | XX]Optional[GT | LT]Optional[CH]Optional[INCR]Multiplescore member',
  },
]

describe('CliBodyWrapper', () => {
  it('should render', () => {
    expect(render(<CommandHelperWrapper />)).toBeTruthy()
  })

  it('Title should be rendered according mocked data', () => {
    const titleArgsId = 'cli-helper-title-args'

    mockedCommands.forEach(({ matchedCommand, argStr = '' }) => {
      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CommandHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
      expect(screen.getByTestId(titleArgsId)).toHaveTextContent(argStr)

      unmount()
    })
  })

  it('Arguments list text should be rendered according mocked data', () => {
    const argsId = 'cli-helper-arguments'

    mockedCommands.forEach(({ matchedCommand, argListText = '' }) => {
      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CommandHelperWrapper />)

      if (argListText) {
        expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
        expect(screen.getByTestId(argsId)).toHaveTextContent(argListText)
      }

      unmount()
    })
  })

  it('Since should be rendered according mocked data', () => {
    const sinceId = 'cli-helper-since'

    mockedCommands.forEach(({ matchedCommand = '' }) => {
      const since = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.since

      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CommandHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
      expect(screen.getByTestId(sinceId)).toHaveTextContent(since)

      unmount()
    })
  })

  it('Complexity should be rendered according mocked data', () => {
    const complexityId = 'cli-helper-complexity'

    mockedCommands.forEach(({ matchedCommand = '' }) => {
      const complexity =
        ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.complexity

      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CommandHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()

      if (complexity) {
        expect(screen.getByTestId(complexityId)).toBeInTheDocument()
        expect(screen.getByTestId(complexityId)).toHaveTextContent(complexity)
      }

      unmount()
    })
  })

  it('should render search results', () => {
    mockedCommands.forEach(({ matchedCommand }) => {
      cliSettingsSelector.mockImplementation(() => ({
        searchingCommand: matchedCommand,
        searchedCommand: '',
        isSearching: true,
      }))
      const { unmount } = render(<CommandHelperWrapper />)
      expect(
        screen.getByTestId(
          `cli-helper-output-title-${matchedCommand.toUpperCase()}`,
        ),
      ).toBeInTheDocument()
      unmount()
    })
  })

  it('should render default message when matched command is deprecated', () => {
    const sinceId = 'cli-helper-since'
    const cliHelperDefaultId = 'cli-helper-default'

    cliSettingsSelector.mockImplementation(() => ({
      matchedCommand: 'GRAPH.CONFIG SET',
      isEnteringCommand: true,
    }))

    const { unmount, queryByTestId } = render(<CommandHelperWrapper />)

    expect(queryByTestId(cliHelperDefaultId)).toBeInTheDocument()
    expect(queryByTestId(sinceId)).not.toBeInTheDocument()

    unmount()
  })
})
