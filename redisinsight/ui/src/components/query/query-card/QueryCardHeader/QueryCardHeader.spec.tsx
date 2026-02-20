import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  act,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import QueryCardHeader, { Props } from './QueryCardHeader'
import {
  QueryResultsProvider,
  QueryResultsTelemetry,
} from '../../context/query-results.context'

const mockedProps = mock<Props>()

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

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [
      {
        id: '1',
        uniqId: '1',
        name: 'test',
        plugin: '',
        activationMethod: 'render',
        matchCommands: ['FT.SEARCH'],
      },
    ],
  }),
}))

const mockTelemetry: QueryResultsTelemetry = {
  onCommandCopied: jest.fn(),
  onResultCleared: jest.fn(),
  onResultCollapsed: jest.fn(),
  onResultExpanded: jest.fn(),
  onResultViewChanged: jest.fn(),
  onFullScreenToggled: jest.fn(),
  onQueryReRun: jest.fn(),
}

const renderQueryCardHeaderComponent = (
  props: Props,
  telemetry: QueryResultsTelemetry = mockTelemetry,
) => {
  return render(
    <QueryResultsProvider telemetry={telemetry}>
      <QueryCardHeader {...instance(mockedProps)} {...props} />
    </QueryResultsProvider>,
    {
      store,
    },
  )
}

describe('QueryCardHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(
      renderQueryCardHeaderComponent({ ...instance(mockedProps) }),
    ).toBeTruthy()
  })

  it('should render tooltip in milliseconds', async () => {
    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      executionTime: 12345678910,
    })

    await act(async () => {
      fireEvent.focus(screen.getByTestId('command-execution-time-icon'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getByTestId('execution-time-tooltip')).toHaveTextContent(
      '12 345 678.91 msec',
    )
  })

  it('should render disabled copy button', async () => {
    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      emptyCommand: true,
    })

    expect(screen.getByTestId('copy-command-btn')).toBeDisabled()
  })

  it('should call telemetry onCommandCopied after click on copy btn', async () => {
    const command = 'info'

    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: command,
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-command-btn'))
    })

    expect(mockTelemetry.onCommandCopied).toHaveBeenCalledWith({
      command,
      databaseId: INSTANCE_ID_MOCK,
    })
  })

  it('should call telemetry onResultCollapsed when clicking collapse button while open', async () => {
    const command = 'info'
    const mockToggleOpen = jest.fn()

    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: command,
      isOpen: true,
      toggleOpen: mockToggleOpen,
    })

    const collapseButton = screen.getByTestId('query-card-open')
    expect(collapseButton).toBeInTheDocument()

    fireEvent.click(collapseButton)
    expect(mockToggleOpen).toHaveBeenCalled()

    expect(mockTelemetry.onResultCollapsed).toHaveBeenCalledWith({
      command,
      databaseId: INSTANCE_ID_MOCK,
    })
  })

  it('should call telemetry onResultExpanded when clicking expand button while closed', async () => {
    const command = 'info'
    const mockToggleOpen = jest.fn()

    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: command,
      isOpen: false,
      toggleOpen: mockToggleOpen,
    })

    const collapseButton = screen.getByTestId('query-card-open')
    expect(collapseButton).toBeInTheDocument()

    fireEvent.click(collapseButton)
    expect(mockToggleOpen).toHaveBeenCalled()

    expect(mockTelemetry.onResultExpanded).toHaveBeenCalledWith({
      command,
      databaseId: INSTANCE_ID_MOCK,
    })
  })

  it('should call telemetry onResultCleared when clicking delete button', async () => {
    const command = 'info'
    const mockOnQueryDelete = jest.fn()

    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: command,
      isOpen: true,
      onQueryDelete: mockOnQueryDelete,
    })

    const deleteButton = screen.getByTestId('delete-command')
    expect(deleteButton).toBeInTheDocument()

    fireEvent.click(deleteButton)
    expect(mockOnQueryDelete).toHaveBeenCalled()

    expect(mockTelemetry.onResultCleared).toHaveBeenCalledWith({
      command,
      databaseId: INSTANCE_ID_MOCK,
    })
  })

  it('should call telemetry onQueryReRun when clicking re-run button', async () => {
    const command = 'info'
    const mockOnQueryReRun = jest.fn()

    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: command,
      isOpen: true,
      onQueryReRun: mockOnQueryReRun,
    })

    const reRunButton = screen.getByTestId('re-run-command')
    expect(reRunButton).toBeInTheDocument()

    fireEvent.click(reRunButton)
    expect(mockOnQueryReRun).toHaveBeenCalled()

    expect(mockTelemetry.onQueryReRun).toHaveBeenCalledWith({
      command,
      databaseId: INSTANCE_ID_MOCK,
    })
  })

  it('should not call telemetry callbacks when none are provided', async () => {
    const command = 'info'
    const mockOnQueryDelete = jest.fn()

    renderQueryCardHeaderComponent(
      {
        ...instance(mockedProps),
        query: command,
        isOpen: true,
        onQueryDelete: mockOnQueryDelete,
      },
      {},
    )

    const deleteButton = screen.getByTestId('delete-command')
    fireEvent.click(deleteButton)

    expect(mockOnQueryDelete).toHaveBeenCalled()
    // Should not throw when telemetry callbacks are undefined
  })
})
