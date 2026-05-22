import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'
import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import { type Props as QueryProps } from 'uiSrc/pages/workbench/components/query/QueryWrapper.types'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  clearWbResults,
  loadWBHistory,
  processWBCommand,
  sendWBCommandAction,
  sendWbQueryAction,
  workbenchResultsSelector,
} from 'uiSrc/slices/workbench/wb-results'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { Environment } from 'apiClient'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import WBViewWrapper from './WBViewWrapper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/pages/workbench/components/query', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

let capturedOnSubmit: QueryProps['onSubmit'] | null = null

const QueryWrapperMock = (props: QueryProps) => {
  capturedOnSubmit = props.onSubmit
  return (
    <div
      onKeyDown={(e: any) => props.onKeyDown?.(e, 'get')}
      data-testid="query"
      aria-label="query"
      role="textbox"
      tabIndex={0}
    />
  )
}

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
  }),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-results'),
  sendWbQueryAction: jest.fn(() => ({ type: '__test_sendWbQueryAction__' })),
  sendWBCommandAction: jest.fn(() => ({
    type: '__test_sendWBCommandAction__',
  })),
  sendWBCommandClusterAction: jest.fn(),
  processUnsupportedCommand: jest.fn(),
  updateCliCommandHistory: jest.fn,
  workbenchResultsSelector: jest.fn().mockReturnValue({
    loading: false,
    items: [],
  }),
}))

jest.mock('uiSrc/components/hooks/useDatabaseEnvironment', () => ({
  useDatabaseEnvironment: jest.fn().mockReturnValue({
    environment: 'unspecified',
    isDangerousCommand: () => false,
  }),
}))

jest.mock('uiSrc/slices/workbench/wb-tutorials', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/workbench/wb-tutorials',
  ).initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-tutorials'),
    workbenchTutorialsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('WBViewWrapper', () => {
  beforeAll(() => {
    QueryWrapper.mockImplementation(QueryWrapperMock)
  })

  it('should render', () => {
    expect(render(<WBViewWrapper />)).toBeTruthy()
  })

  it('should render with SessionStorage', () => {
    render(<WBViewWrapper />)

    const expectedActions = [loadWBHistory()]
    expect(
      clearStoreActions(store.getActions().slice(0, expectedActions.length)),
    ).toEqual(clearStoreActions(expectedActions))
  })

  it('should call delete command', () => {
    ;(workbenchResultsSelector as jest.Mock).mockImplementation(() => ({
      items: [{ id: '1' }],
    }))
    render(<WBViewWrapper />)

    fireEvent.click(screen.getByTestId('delete-command'))
    expect(clearStoreActions(store.getActions().slice(-1))).toEqual(
      clearStoreActions([processWBCommand('1')]),
    )
  })

  it('should call delete all command', () => {
    ;(workbenchResultsSelector as jest.Mock).mockImplementation(() => ({
      items: [{ id: '1' }],
    }))
    render(<WBViewWrapper />)

    fireEvent.click(screen.getByTestId('clear-history-btn'))
    expect(clearStoreActions(store.getActions().slice(-1))).toEqual(
      clearStoreActions([clearWbResults()]),
    )
  })

  it('should be disabled button when commands are processing', () => {
    ;(workbenchResultsSelector as jest.Mock).mockImplementation(() => ({
      items: [{ id: '1' }],
      processing: true,
    }))
    render(<WBViewWrapper />)

    expect(screen.getByTestId('clear-history-btn')).toBeDisabled()
  })

  it('should not display clear results when with empty history', () => {
    ;(workbenchResultsSelector as jest.Mock).mockImplementation(() => ({
      items: [],
    }))
    render(<WBViewWrapper />)

    expect(screen.queryByTestId('clear-history-btn')).not.toBeInTheDocument()
  })

  describe('dangerous-command gating', () => {
    const instance = DBInstanceFactory.build({
      name: 'prod-db',
      connectionType: ConnectionType.Standalone,
    })

    beforeEach(() => {
      capturedOnSubmit = null
      ;(sendWbQueryAction as jest.Mock).mockClear()
      ;(connectedInstanceSelector as jest.Mock).mockImplementation(
        () => instance,
      )
    })

    afterEach(() => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: 'unspecified',
        isDangerousCommand: () => false,
      })
    })

    it('does not show the modal and dispatches when no command is dangerous', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })

      render(<WBViewWrapper />)
      act(() => {
        capturedOnSubmit?.('PING')
      })

      expect(
        screen.queryByTestId('type-to-confirm-modal-title'),
      ).not.toBeInTheDocument()
      expect(sendWbQueryAction).toHaveBeenCalledTimes(1)
      expect((sendWbQueryAction as jest.Mock).mock.calls[0][0]).toBe('PING')
    })

    it('shows the modal and defers dispatch when a command is dangerous', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: (cmd: string) =>
          ['FLUSHALL', 'FLUSHDB'].includes(cmd.toUpperCase()),
      })

      render(<WBViewWrapper />)
      act(() => {
        capturedOnSubmit?.('PING\nFLUSHALL\nFLUSHDB')
      })

      expect(
        screen.getByTestId('type-to-confirm-modal-title'),
      ).toBeInTheDocument()
      const description = screen.getByTestId(
        'type-to-confirm-modal-description',
      )
      expect(description).toHaveTextContent(instance.name!)
      expect(description).toHaveTextContent('FLUSHALL, FLUSHDB')
      expect(sendWbQueryAction).not.toHaveBeenCalled()
    })

    it('falls back to host:port when the connected instance has no name', () => {
      const namelessInstance = DBInstanceFactory.build({
        name: undefined,
        host: 'h',
        port: 6379,
        connectionType: ConnectionType.Standalone,
      })
      ;(connectedInstanceSelector as jest.Mock).mockImplementation(
        () => namelessInstance,
      )
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: (cmd: string) => cmd.toUpperCase() === 'FLUSHALL',
      })

      render(<WBViewWrapper />)
      act(() => {
        capturedOnSubmit?.('FLUSHALL')
      })

      expect(
        screen.getByTestId('type-to-confirm-modal-description'),
      ).toHaveTextContent('h:6379')
    })

    it('dispatches the original batch after typing the database name and confirming', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: (cmd: string) => cmd.toUpperCase() === 'FLUSHALL',
      })

      render(<WBViewWrapper />)
      act(() => {
        capturedOnSubmit?.('PING\nFLUSHALL')
      })

      fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
        target: { value: instance.name },
      })
      fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

      expect(
        screen.queryByTestId('type-to-confirm-modal-title'),
      ).not.toBeInTheDocument()
      expect(sendWbQueryAction).toHaveBeenCalledTimes(1)
      expect((sendWbQueryAction as jest.Mock).mock.calls[0][0]).toBe(
        'PING\nFLUSHALL',
      )
    })

    it('does not dispatch when the modal is cancelled', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: (cmd: string) => cmd.toUpperCase() === 'FLUSHALL',
      })

      render(<WBViewWrapper />)
      act(() => {
        capturedOnSubmit?.('FLUSHALL')
      })

      fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

      expect(
        screen.queryByTestId('type-to-confirm-modal-title'),
      ).not.toBeInTheDocument()
      expect(sendWbQueryAction).not.toHaveBeenCalled()
    })
  })

  it.skip('"onSubmit" for Cluster connection should call "sendWBCommandClusterAction"', async () => {
    ;(connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      id: '123',
      connectionType: 'CLUSTER',
    }))

    const sendWBCommandClusterActionMock = jest.fn()

    ;(sendWBCommandAction as jest.Mock).mockImplementation(
      () => sendWBCommandClusterActionMock,
    )

    const { queryAllByTestId } = render(<WBViewWrapper />)

    // Act
    await act(() => {
      fireEvent.click(queryAllByTestId(/preselect-/)[0])
    })

    const monacoEl = screen.getByTestId('query')

    fireEvent.keyDown(monacoEl, {
      code: 'Enter',
      ctrlKey: true,
    })

    expect(sendWBCommandClusterActionMock).toBeCalled()
  })
})
