import { cloneDeep, last } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { clearOutput, updateCliHistoryStorage } from 'uiSrc/utils/cliHelper'
import { MOCK_COMMANDS_ARRAY } from 'uiSrc/constants'
import CliBody, { Props } from './CliBody'

const mockedProps = mock<Props>()

let store: typeof mockedStore
const commandHistory = ['info', 'hello', 'keys *', 'clear']
const commandsArr = MOCK_COMMANDS_ARRAY
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'
const cliOutputPath = 'uiSrc/slices/cli/cli-output'
const cliCommand = 'cli-command'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock(cliOutputPath, () => {
  const defaultState = jest.requireActual(cliOutputPath).initialState
  return {
    ...jest.requireActual(cliOutputPath),
    setOutputInitialState: jest.fn,
    outputSelector: jest.fn().mockReturnValue({
      ...defaultState,
      commandHistory,
    }),
  }
})

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

jest.mock('uiSrc/utils/cliHelper', () => ({
  ...jest.requireActual('uiSrc/utils/cliHelper'),
  updateCliHistoryStorage: jest.fn(),
  clearOutput: jest.fn(),
}))

describe('CliBody', () => {
  it('should render', () => {
    expect(render(<CliBody {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('Input should render without error', () => {
    render(<CliBody {...instance(mockedProps)} />)

    const cliInput = screen.queryByTestId(cliCommand)

    expect(cliInput).toBeInTheDocument()
  })

  it('Input should not render with error', () => {
    render(<CliBody {...instance(mockedProps)} error="error" />)

    const cliInput = screen.queryByTestId(cliCommand)

    expect(cliInput).toBeNull()
  })

  describe('CLI input special commands', () => {
    it('"clear" command should call "setOutputInitialState"', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()

      const command = 'clear'

      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'Enter',
      })

      expect(clearOutput).toBeCalled()
      expect(updateCliHistoryStorage).toBeCalledWith(
        command,
        expect.any(Function),
      )

      expect(setCommandMock).toBeCalledWith('')
      expect(onSubmitMock).not.toBeCalled()
    })
  })

  describe('CLI input keyboard cases', () => {
    it('"Enter" keydown should call "onSubmit"', () => {
      const command = 'info'
      const onSubmitMock = jest.fn()

      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'Enter',
      })

      expect(updateCliHistoryStorage).toBeCalledWith(
        command,
        expect.any(Function),
      )
      expect(onSubmitMock).toBeCalled()
    })

    it('"Ctrl+l" hot key for Windows OS should call "setOutputInitialState"', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'l',
        ctrlKey: true,
      })

      expect(clearOutput).toBeCalled()

      expect(setCommandMock).toBeCalledWith('')
      expect(onSubmitMock).not.toBeCalled()
    })

    it('"Command+k" hot key for MacOS should call "setOutputInitialState"', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'k',
        metaKey: true,
      })

      expect(clearOutput).toBeCalled()

      expect(setCommandMock).toBeCalledWith('')
      expect(onSubmitMock).not.toBeCalled()
    })

    it('"ArrowUp" should call "setCommand" with commands from history', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'ArrowUp',
      })

      expect(setCommandMock).toBeCalledWith(commandHistory[0])

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'ArrowUp',
      })
      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'ArrowUp',
      })

      expect(setCommandMock).toBeCalledWith(commandHistory[2])

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"ArrowDown" should call "setCommand" with commands from history', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      for (let index = 0; index < 3; index++) {
        fireEvent.keyDown(screen.getByTestId(cliCommand), {
          key: 'ArrowUp',
        })
      }

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: 'ArrowDown',
      })

      expect(setCommandMock).toBeCalledWith(commandHistory[2])

      for (let index = 0; index < 3; index++) {
        fireEvent.keyDown(screen.getByTestId(cliCommand), {
          key: 'ArrowDown',
        })
      }

      expect(setCommandMock).toBeCalledWith('')
      expect(setCommandMock).toBeCalledTimes(6)

      for (let index = 0; index < 2; index++) {
        fireEvent.keyDown(screen.getByTestId(cliCommand), {
          key: 'ArrowDown',
        })
      }

      expect(setCommandMock).toBeCalledTimes(6)

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"Tab" with command="" should setCommand first command from constants/commands ', () => {
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command=""
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: keys.TAB,
      })

      expect(setCommandMock).toBeCalledWith(commandsArr[0])

      expect(onSubmitMock).not.toBeCalled()
    })

    // eslint-disable-next-line max-len
    it('"Tab" with command="g" should setCommand first command starts with "g" from constants/commands ', () => {
      const command = 'g'
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: keys.TAB,
      })

      expect(setCommandMock).toBeCalledWith(
        commandsArr.filter((cmd: string) =>
          cmd.startsWith(command.toUpperCase()),
        )[0],
      )

      expect(onSubmitMock).not.toBeCalled()
    })

    // eslint-disable-next-line max-len
    it('"Shift+Tab" with command="g" should setCommand last command starts with "g" from constants/commands ', () => {
      const command = 'g'
      const onSubmitMock = jest.fn()
      const setCommandMock = jest.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: keys.TAB,
        shiftKey: true,
      })

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: keys.TAB,
      })

      fireEvent.keyDown(screen.getByTestId(cliCommand), {
        key: keys.TAB,
        shiftKey: true,
      })

      expect(setCommandMock).toBeCalledWith(
        last(
          commandsArr.filter((cmd: string) =>
            cmd.startsWith(command.toUpperCase()),
          ),
        ),
      )

      expect(onSubmitMock).not.toBeCalled()
    })
  })
})
