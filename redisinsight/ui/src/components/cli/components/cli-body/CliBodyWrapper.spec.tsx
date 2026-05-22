import React from 'react'
import { cloneDeep, first } from 'lodash'
import { useSelector } from 'react-redux'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'

import {
  sendCliClusterCommandAction,
  sendCliCommandAction,
} from 'uiSrc/slices/cli/cli-output'
import { processCliClient } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { processUnsupportedCommand } from 'uiSrc/utils/cliOutputActions'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import CliBodyWrapper from './CliBodyWrapper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
    db: 0,
  }),
}))

jest.mock('uiSrc/slices/cli/cli-output', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-output'),
  sendCliClusterCommandAction: jest.fn(),
  sendCliCommandAction: jest.fn(),
  processUnsupportedCommand: jest.fn(),
  updateCliCommandHistory: jest.fn,
  concatToOutput: () => jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getCommandRepeat: jest.fn().mockReturnValue(['', 1]),
  isRepeatCountCorrect: jest.fn().mockReturnValue(true),
}))

jest.mock('uiSrc/components/hooks/useDatabaseEnvironment', () => ({
  useDatabaseEnvironment: jest.fn().mockReturnValue({
    environment: 'unspecified',
    isDangerousCommand: () => false,
  }),
}))

jest.mock('uiSrc/utils/cliHelper', () => ({
  ...jest.requireActual('uiSrc/utils/cliHelper'),
  updateCliHistoryStorage: jest.fn(),
  clearOutput: jest.fn(),
  cliParseTextResponse: jest.fn(),
  cliParseTextResponseWithOffset: jest.fn(),
}))

const unsupportedCommands = ['sync', 'subscription']
const cliCommandTestId = 'cli-command'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

describe('CliBodyWrapper', () => {
  beforeEach(() => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: any) => any) =>
        callback({
          ...state,
          cli: {
            ...state.cli,
            settings: { ...state.cli.settings, loading: false },
          },
        }),
    )
  })
  it('should render and call process cli client', () => {
    const expectedActions = [processCliClient()]

    expect(render(<CliBodyWrapper />)).toBeTruthy()
    expect(
      clearStoreActions(store.getActions().slice(0, expectedActions.length)),
    ).toEqual(clearStoreActions(expectedActions))
  })

  // It's not possible to simulate events on contenteditable with testing-react-library,
  // or any testing library that uses js - dom, because of a limitation on js - dom itself.
  // https://github.com/testing-library/dom-testing-library/pull/235
  it.skip('"onSubmit" should check unsupported commands', () => {
    const processUnsupportedCommandMock = jest.fn()

    ;(processUnsupportedCommand as jest.Mock).mockImplementation(
      () => processUnsupportedCommandMock,
    )

    render(<CliBodyWrapper />)

    // Act
    fireEvent.change(screen.getByTestId(cliCommandTestId), {
      target: { value: first(unsupportedCommands) },
    })

    // Act
    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    expect(processUnsupportedCommandMock).toBeCalled()
  })

  describe('dangerous-command gating', () => {
    const mockedConnectedInstanceSelector =
      connectedInstanceSelector as jest.Mock
    const mockedSendCliCommandAction = sendCliCommandAction as jest.Mock
    const mockedUseDatabaseEnvironment = useDatabaseEnvironment as jest.Mock
    const mockedGetCommandRepeat = jest.requireMock('uiSrc/utils')
      .getCommandRepeat as jest.Mock

    beforeEach(() => {
      const prodInstance = DBInstanceFactory.build({
        name: 'prod-db',
        connectionType: ConnectionType.Standalone,
      })
      mockedConnectedInstanceSelector.mockReturnValue(prodInstance)
      mockedGetCommandRepeat.mockReturnValue(['FLUSHDB', 1])
    })

    const setDangerousEnvironment = (isDangerous: boolean) => {
      mockedUseDatabaseEnvironment.mockReturnValue({
        environment: isDangerous ? 'production' : 'unspecified',
        isDangerousCommand: () => isDangerous,
      })
    }

    it('does not dispatch the command and shows the modal when the command is dangerous', () => {
      const sendCliCommandActionMock = jest.fn()
      mockedSendCliCommandAction.mockImplementation(
        () => sendCliCommandActionMock,
      )
      setDangerousEnvironment(true)

      render(<CliBodyWrapper />)

      fireEvent.keyDown(screen.getByTestId(cliCommandTestId), { key: 'Enter' })

      expect(sendCliCommandActionMock).not.toHaveBeenCalled()
      expect(screen.getByTestId('type-to-confirm-modal-title')).toBeTruthy()
    })

    it('dispatches the command after the user confirms in the modal', () => {
      const sendCliCommandActionMock = jest.fn()
      mockedSendCliCommandAction.mockImplementation(
        () => sendCliCommandActionMock,
      )
      setDangerousEnvironment(true)

      render(<CliBodyWrapper />)
      fireEvent.keyDown(screen.getByTestId(cliCommandTestId), { key: 'Enter' })

      fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
        target: { value: 'prod-db' },
      })
      fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

      expect(sendCliCommandActionMock).toHaveBeenCalled()
    })

    it('does not dispatch the command when the user cancels the modal', () => {
      const sendCliCommandActionMock = jest.fn()
      mockedSendCliCommandAction.mockImplementation(
        () => sendCliCommandActionMock,
      )
      setDangerousEnvironment(true)

      render(<CliBodyWrapper />)
      fireEvent.keyDown(screen.getByTestId(cliCommandTestId), { key: 'Enter' })

      fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

      expect(sendCliCommandActionMock).not.toHaveBeenCalled()
    })

    it('passes commands through without modal when isDangerousCommand returns false', () => {
      const sendCliCommandActionMock = jest.fn()
      mockedSendCliCommandAction.mockImplementation(
        () => sendCliCommandActionMock,
      )
      setDangerousEnvironment(false)

      render(<CliBodyWrapper />)
      fireEvent.keyDown(screen.getByTestId(cliCommandTestId), { key: 'Enter' })

      expect(sendCliCommandActionMock).toHaveBeenCalled()
      expect(screen.queryByTestId('type-to-confirm-modal-title')).toBeNull()
    })
  })

  it('"onSubmit" for Cluster connection should call "sendCliClusterCommandAction"', () => {
    ;(connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      id: '123',
      connectionType: 'CLUSTER',
      db: 0,
    }))

    const sendCliClusterActionMock = jest.fn()

    ;(sendCliClusterCommandAction as jest.Mock).mockImplementation(
      () => sendCliClusterActionMock,
    )

    render(<CliBodyWrapper />)

    // Act
    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    expect(sendCliClusterActionMock).toBeCalled()
  })
})
