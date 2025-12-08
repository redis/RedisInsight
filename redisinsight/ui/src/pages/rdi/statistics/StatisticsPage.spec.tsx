import { cloneDeep } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import { getPipelineStatus } from 'uiSrc/slices/rdi/pipeline'
import {
  getStatistics,
  rdiStatisticsSelector,
} from 'uiSrc/slices/rdi/statistics'
import {
  TelemetryEvent,
  TelemetryPageView,
  sendEventTelemetry,
  sendPageViewTelemetry,
} from 'uiSrc/telemetry'
import {
  cleanup,
  userEvent,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import { PageNames, Pages } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { RdiPipelineStatus } from 'uiSrc/slices/interfaces'

import StatisticsPage from './StatisticsPage'

const CONNECTIONS_DATA = {
  connections: {
    Connection1: {
      status: 'good',
      type: 'type1',
      host: 'Redis-Cloud',
      port: 12000,
      database: 'admin',
      user: 'admin',
    },
  },
  dataStreams: {
    Stream1: {
      total: 35,
      pending: 2,
      inserted: 2530,
      updated: 65165,
      deleted: 1,
      filtered: 0,
      rejected: 5,
      deduplicated: 0,
      lastArrival: '1 Hour',
    },
  },
  processingPerformance: {
    totalBatches: 3427,
    batchSizeAvg: '0.93',
    readTimeAvg: '13',
    processTimeAvg: '24',
    ackTimeAvg: '6.2',
    totalTimeAvg: '6.1',
    recPerSecAvg: 110,
  },
  rdiPipelineStatus: {
    rdiVersion: '2.0',
    address: '172.17.0.2:12006',
    runStatus: 'Started',
    syncMode: 'Streaming',
  },
  clients: {
    9875: {
      addr: '172.16.0.2:62356',
      name: 'redis-di-cli',
      ageSec: 100,
      idleSec: 2,
      user: 'default',
    },
  },
}

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name',
  }),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineStatusSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {
      components: { processor: 'ready' },
      pipelines: {
        default: {
          status: 'ready',
          state: 'some',
          tasks: 'none',
        },
      },
    },
  }),
}))

jest.mock('uiSrc/slices/rdi/statistics', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/statistics'),
  rdiStatisticsSelector: jest.fn().mockReturnValue({
    loading: false,
    results: {
      status: 'success',
      data: CONNECTIONS_DATA,
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(sendEventTelemetry as jest.Mock).mockRestore()
})

describe('StatisticsPage', () => {
  it('should render', () => {
    expect(render(<StatisticsPage />)).toBeTruthy()
  })

  it('renders the page with correct title', () => {
    render(<StatisticsPage />)
    expect(document.title).toBe('name - Pipeline Status')
  })

  it('renders null when statisticsResults is not available', () => {
    ;(rdiStatisticsSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      results: null,
    })
    const { container } = render(<StatisticsPage />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the empty state when statistics status is not success', () => {
    ;(rdiStatisticsSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      results: {
        status: null,
        data: CONNECTIONS_DATA,
      },
    })
    render(<StatisticsPage />)
    expect(screen.getByTestId('empty-pipeline')).toBeInTheDocument()
  })

  it('renders the empty state when statistics status is success but data is missing', () => {
    ;(rdiStatisticsSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      results: {
        status: RdiPipelineStatus.Success,
        data: null,
      },
    })
    render(<StatisticsPage />)
    expect(screen.getByTestId('empty-pipeline')).toBeInTheDocument()
  })

  it('renders statistics sections when status is success and data exists', async () => {
    render(<StatisticsPage />)

    // Check that statistics sections are rendered instead of empty state
    expect(screen.queryByTestId('empty-pipeline')).not.toBeInTheDocument()
    expect(
      await screen.findByTestId('processing-performance-info-refresh-btn'),
    ).toBeInTheDocument()
  })

  it('should call proper telemetry on page view', () => {
    render(<StatisticsPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_STATUS,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
      },
    })
  })

  it('should call proper telemetry event when refresh is clicked for processing performance section', async () => {
    render(<StatisticsPage />)

    fireEvent.click(
      await screen.findByTestId('processing-performance-info-refresh-btn'),
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance',
      },
    })
  })

  xit('should call proper telemetry event when refresh is clicked for data streams section', () => {
    render(<StatisticsPage />)

    fireEvent.click(screen.getByTestId('data-streams-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams',
      },
    })
  })

  xit('should call proper telemetry event when refresh is clicked for clients section', () => {
    render(<StatisticsPage />)

    fireEvent.click(screen.getByTestId('clients-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients',
      },
    })
  })

  it('should call proper telemetry event when auto refresh is disabled for processing performance section', async () => {
    render(<StatisticsPage />)

    const testid = 'processing-performance-info'

    await userEvent.click(
      await screen.findByTestId(`${testid}-auto-refresh-config-btn`),
    )
    await waitForRiPopoverVisible()
    await userEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance',
        enableAutoRefresh: false,
        refreshRate: '5.0',
      },
    })
  })

  it('should call proper telemetry event when auto refresh is enabled for processing performance section', async () => {
    render(<StatisticsPage />)

    const testid = 'processing-performance-info'

    await userEvent.click(
      await screen.findByTestId(`${testid}-auto-refresh-config-btn`),
    )
    await waitForRiPopoverVisible()
    await userEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled
    await userEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance',
        enableAutoRefresh: true,
        refreshRate: '5.0',
      },
    })
  })

  xit('should call proper telemetry event when auto refresh is enabled for data streams section', async () => {
    render(<StatisticsPage />)

    const testid = 'data-streams'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams',
        enableAutoRefresh: true,
        refreshRate: '5.0',
      },
    })
  })

  xit('should call proper telemetry event when auto refresh is disabled for data streams section', async () => {
    render(<StatisticsPage />)

    const testid = 'data-streams'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams',
        enableAutoRefresh: false,
        refreshRate: '5.0',
      },
    })
  })

  xit('should call proper telemetry event when auto refresh is enabled for clients section', async () => {
    render(<StatisticsPage />)

    const testid = 'clients'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients',
        enableAutoRefresh: true,
        refreshRate: '5.0',
      },
    })
  })

  xit('should call proper telemetry event when auto refresh is disabled for clients section', async () => {
    render(<StatisticsPage />)

    const testid = 'clients'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients',
        enableAutoRefresh: false,
        refreshRate: '5.0',
      },
    })
  })

  it('should get statistics on mount', () => {
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.rdiPipelineConfig('rdiInstanceId') })

    render(<StatisticsPage />)

    const expectedActions = [getPipelineStatus(), getStatistics()]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })

  it('should save proper page on unmount', () => {
    const { unmount } = render(<StatisticsPage />)

    unmount()
    const expectedActions = [setLastPageContext(PageNames.rdiStatistics)]

    expect(store.getActions().slice(0 - expectedActions.length)).toEqual(
      expectedActions,
    )
  })
})
