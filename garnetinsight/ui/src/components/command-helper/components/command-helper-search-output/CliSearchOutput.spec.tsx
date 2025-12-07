import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { setSearchedCommand } from 'uiSrc/slices/cli/cli-settings'

import CHSearchOutput from './CHSearchOutput'

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'
let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

interface IMockedCommands {
  matchedCommand: string
  argStr?: string
  summary?: string
}

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'HSET',
    argStr: 'key field value [field value ...]',
  },
  {
    matchedCommand: 'GEOADD',
    argStr:
      'key [NX | XX] [CH] longitude latitude member [longitude latitude member ...]',
  },
  {
    matchedCommand: 'ZADD',
    argStr:
      'key [NX | XX] [GT | LT] [CH] [INCR] score member [score member ...]',
  },
  {
    matchedCommand: 'RESET',
    summary: 'Reset the connection',
  },
]

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

describe('CHSearchOutput', () => {
  it('should render', () => {
    expect(render(<CHSearchOutput searchedCommands={[]} />)).toBeTruthy()
  })

  it('should render no results', () => {
    render(<CHSearchOutput searchedCommands={[]} />)
    expect(screen.getByTestId('search-cmds-no-results')).toBeInTheDocument()
  })

  it('should render searched commands results', () => {
    const searchedCommands = mockedCommands.map(
      (command) => command.matchedCommand,
    )
    render(<CHSearchOutput searchedCommands={searchedCommands} />)
    searchedCommands.forEach((command) => {
      expect(
        screen.getByTestId(`cli-helper-output-title-${command}`),
      ).toBeInTheDocument()
    })
  })

  it('should render searched commands results with proper args or summary', () => {
    const searchedCommands = mockedCommands.map(
      (command) => command.matchedCommand,
    )
    render(<CHSearchOutput searchedCommands={searchedCommands} />)
    mockedCommands.forEach((command) => {
      if (command.argStr) {
        expect(
          screen.getByTestId(
            `cli-helper-output-args-${command.matchedCommand}`,
          ),
        ).toHaveTextContent(command.argStr || '')
      } else {
        expect(
          screen.getByTestId(
            `cli-helper-output-summary-${command.matchedCommand}`,
          ),
        ).toHaveTextContent(command.summary || '')
      }
    })
  })

  it('should call setSearchedCommand after click any command', () => {
    const searchedCommands = mockedCommands.map(
      (command) => command.matchedCommand,
    )
    const anySearchCommand = searchedCommands[0]
    render(<CHSearchOutput searchedCommands={searchedCommands} />)
    fireEvent.click(
      screen.getByTestId(`cli-helper-output-title-${anySearchCommand}`),
    )
    expect(store.getActions()).toEqual([setSearchedCommand(anySearchCommand)])
  })
})
