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

import { sendCliClusterCommandAction } from 'uiSrc/slices/cli/cli-output'
import { processCliClient } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { processUnsupportedCommand } from 'uiSrc/utils/cliOutputActions'

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
  processUnsupportedCommand: jest.fn(),
  updateCliCommandHistory: jest.fn,
  concatToOutput: () => jest.fn(),
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
