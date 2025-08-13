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
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import QueryCardHeader, { HIDE_FIELDS, Props } from './QueryCardHeader'
import {
  ViewMode,
  ViewModeContextProvider,
} from '../../context/view-mode.context'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

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

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderQueryCardHeaderComponent = (
  props: Props,
  viewMode: ViewMode = ViewMode.Workbench,
) => {
  return render(
    <ViewModeContextProvider viewMode={viewMode}>
      <QueryCardHeader {...instance(mockedProps)} {...props} />
    </ViewModeContextProvider>,
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
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

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

    expect(screen.getByTestId('copy-command')).toBeDisabled()
  })

  it('should hide Profiler button', async () => {
    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: 'FT.GET something',
      isOpen: true,
      hideFields: [HIDE_FIELDS.profiler],
    })

    expect(screen.queryByTestId('run-profile-type')).not.toBeInTheDocument()
  })

  it('should hide Change View Type button', async () => {
    renderQueryCardHeaderComponent({
      ...instance(mockedProps),
      query: 'FT.SEARCH index somethingCool',
      isOpen: true,
      hideFields: [HIDE_FIELDS.viewType],
    })

    expect(screen.queryByTestId('select-view-type')).not.toBeInTheDocument()
  })

  describe('Workbech View Mode', () => {
    it('should call event telemetry for workbench after click on copy btn', async () => {
      const command = 'info'

      renderQueryCardHeaderComponent({
        ...instance(mockedProps),
        query: command,
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('copy-command'))
      })

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
        eventData: {
          command,
          databaseId: INSTANCE_ID_MOCK,
        },
      })
    })

    it('should collect telemetry when clicking on the "collapse" button', async () => {
      const command = 'info'
      const mockToggleOpen = jest.fn()

      renderQueryCardHeaderComponent({
        ...instance(mockedProps),
        query: command,
        isOpen: true,
        toggleOpen: mockToggleOpen,
      })

      // Simulate clicking the collapse button
      const collapseButton = screen.getByTestId('query-card-open')
      expect(collapseButton).toBeInTheDocument()

      fireEvent.click(collapseButton)
      expect(mockToggleOpen).toHaveBeenCalled()

      // Verify telemetry event is sent for collapsing
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })

    it('should collect telemetry when clicking on the "un-collapse" button', async () => {
      const command = 'info'
      const mockToggleOpen = jest.fn()

      renderQueryCardHeaderComponent({
        ...instance(mockedProps),
        query: command,
        isOpen: false,
        toggleOpen: mockToggleOpen,
      })

      // Simulate clicking the collapse button
      const collapseButton = screen.getByTestId('query-card-open')
      expect(collapseButton).toBeInTheDocument()

      fireEvent.click(collapseButton)
      expect(mockToggleOpen).toHaveBeenCalled()

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })

    it('should collect telemetry when clicking on the "delete" button', async () => {
      const command = 'info'
      const mockOnQueryDelete = jest.fn()

      renderQueryCardHeaderComponent({
        ...instance(mockedProps),
        query: command,
        isOpen: true,
        onQueryDelete: mockOnQueryDelete,
      })

      // Simulate clicking the delete button
      const deleteButton = screen.getByTestId('delete-command')
      expect(deleteButton).toBeInTheDocument()

      fireEvent.click(deleteButton)
      expect(mockOnQueryDelete).toHaveBeenCalled()

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })
  })

  describe('Vector Search View Mode', () => {
    it('should call event telemetry for vector search after click on copy btn', async () => {
      const command = 'MOCK_COMMAND'

      renderQueryCardHeaderComponent(
        {
          ...instance(mockedProps),
          query: command,
        },
        ViewMode.VectorSearch,
      )

      await act(async () => {
        fireEvent.click(screen.getByTestId('copy-command'))
      })

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_COPIED,
        eventData: {
          command,
          databaseId: INSTANCE_ID_MOCK,
        },
      })
    })

    it('should collect telemetry when clicking on the "collapse" button', async () => {
      const command = 'info'
      const mockToggleOpen = jest.fn()

      renderQueryCardHeaderComponent(
        {
          ...instance(mockedProps),
          query: command,
          isOpen: true,
          toggleOpen: mockToggleOpen,
        },
        ViewMode.VectorSearch,
      )

      // Simulate clicking the collapse button
      const collapseButton = screen.getByTestId('query-card-open')
      expect(collapseButton).toBeInTheDocument()

      fireEvent.click(collapseButton)
      expect(mockToggleOpen).toHaveBeenCalled()

      // Verify telemetry event is sent for collapsing
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_COLLAPSED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })

    it('should collect telemetry when clicking on the "un-collapse" button', async () => {
      const command = 'info'
      const mockToggleOpen = jest.fn()

      renderQueryCardHeaderComponent(
        {
          ...instance(mockedProps),
          query: command,
          isOpen: false,
          toggleOpen: mockToggleOpen,
        },
        ViewMode.VectorSearch,
      )

      // Simulate clicking the collapse button
      const collapseButton = screen.getByTestId('query-card-open')
      expect(collapseButton).toBeInTheDocument()

      fireEvent.click(collapseButton)
      expect(mockToggleOpen).toHaveBeenCalled()

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_EXPANDED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })

    it('should collect telemetry when clicking on the "delete" button', async () => {
      const command = 'info'
      const mockOnQueryDelete = jest.fn()

      renderQueryCardHeaderComponent(
        {
          ...instance(mockedProps),
          query: command,
          isOpen: true,
          onQueryDelete: mockOnQueryDelete,
        },
        ViewMode.VectorSearch,
      )

      // Simulate clicking the delete button
      const deleteButton = screen.getByTestId('delete-command')
      expect(deleteButton).toBeInTheDocument()

      fireEvent.click(deleteButton)
      expect(mockOnQueryDelete).toHaveBeenCalled()

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          command,
        },
      })
    })
  })
})
