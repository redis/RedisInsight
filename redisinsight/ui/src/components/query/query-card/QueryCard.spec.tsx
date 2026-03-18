import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import {
  getWbTsResultPreferences,
  setWbTsResultPreferences,
} from 'uiSrc/pages/workbench/utils/tsResultPreferences'
import QueryCard, { Props, getSummaryText } from './QueryCard'
import { QueryResultsProvider } from '../context/query-results.context'

const mockedProps = mock<Props>()

const mockResult = [
  {
    response: 'response',
    status: 'success',
  },
]

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

jest.mock('uiSrc/pages/workbench/utils/tsResultPreferences', () => ({
  ...jest.requireActual('uiSrc/pages/workbench/utils/tsResultPreferences'),
  getWbTsResultPreferences: jest.fn().mockReturnValue(undefined),
  setWbTsResultPreferences: jest.fn(),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

const renderQueryCardComponent = (props: Partial<Props> = {}) => {
  return render(
    <QueryResultsProvider telemetry={{}}>
      <QueryCard {...instance(mockedProps)} {...props} />
    </QueryResultsProvider>,
    {
      store,
    },
  )
}

describe('QueryCard', () => {
  it('should render', () => {
    const { container } = renderQueryCardComponent()
    expect(container).toBeTruthy()
  })

  it('Cli result should not in the document before Expand', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = renderQueryCardComponent()

    const cliResultEl = queryByTestId(cliResultTestId)
    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Cli result should in the document when "isOpen = true"', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = renderQueryCardComponent({
      isOpen: true,
      result: mockResult,
    })

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).toBeInTheDocument()
  })

  it('Cli result should not in the document when "isOpen = false"', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = renderQueryCardComponent({
      isOpen: false,
      result: mockResult,
    })

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Should be in the document when resultsMode === ResultsMode.GroupMode', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = renderQueryCardComponent({
      isOpen: false,
      result: mockResult,
      resultsMode: ResultsMode.GroupMode,
    })

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Click on the header should call onToggleOpen', () => {
    const cardHeaderTestId = 'query-card-open'
    const mockId = '123'
    const mockOnToggleOpen = jest.fn()

    const { queryByTestId } = renderQueryCardComponent({
      id: mockId,
      result: mockResult,
      onToggleOpen: mockOnToggleOpen,
    })

    const cardHeaderTestEl = queryByTestId(cardHeaderTestId)

    fireEvent.click(cardHeaderTestEl)

    expect(mockOnToggleOpen).toHaveBeenCalledWith(mockId, true)
  })

  it('Should return correct summary string', () => {
    const summary = { total: 2, success: 1, fail: 1 }
    const summaryText = '2 Command(s) - 1 success, 1 error(s)'

    const summaryString = getSummaryText(summary)

    expect(summaryString).toEqual(summaryText)
  })

  it('should render QueryCardCliResultWrapper when command is null', () => {
    const { queryByTestId } = renderQueryCardComponent({
      resultsMode: ResultsMode.GroupMode,
      result: null,
      isOpen: true,
      command: null,
    })

    const queryCommonResultEl = queryByTestId('query-common-result-wrapper')
    const queryCliResultEl = queryByTestId('query-cli-result-wrapper')

    expect(queryCommonResultEl).toBeInTheDocument()
    expect(queryCliResultEl).not.toBeInTheDocument()
  })

  it('should render QueryCardCliResult when result reached response size threshold', () => {
    const { queryByTestId } = renderQueryCardComponent({
      resultsMode: ResultsMode.GroupMode,
      result: [
        {
          status: CommandExecutionStatus.Success,
          response: 'Any message about size limit threshold exceeded',
          sizeLimitExceeded: true,
        },
      ],
      isOpen: true,
      command: null,
    })
    const queryCliResultEl = queryByTestId('query-cli-result')

    expect(queryCliResultEl).toBeInTheDocument()
  })

  it('should render properly result when it has pure number', () => {
    const { getByTestId } = renderQueryCardComponent({
      resultsMode: ResultsMode.GroupMode,
      result: [
        {
          status: CommandExecutionStatus.Success,
          response: 1,
        },
      ],
      isOpen: true,
      command: 'del key',
    })
    const queryCliResultEl = getByTestId('query-cli-result')

    expect(queryCliResultEl.textContent).toBe('(integer) 1')
  })

  it('should render QueryCardCliResult when result reached response size threshold even w/o flag', () => {
    const { queryByTestId } = renderQueryCardComponent({
      resultsMode: ResultsMode.GroupMode,
      result: [
        {
          status: CommandExecutionStatus.Success,
          response:
            'Results have been deleted since they exceed 1 MB. Re-run the command to see new results.',
        },
      ],
      isOpen: true,
      command: null,
    })
    const queryCliResultEl = queryByTestId('query-cli-result')

    expect(queryCliResultEl).toBeInTheDocument()
  })

  describe('TimeSeries view persistence', () => {
    const tsVisualization = {
      id: 'redistimeseries-chart',
      uniqId: 'redistimeseries-chart',
      name: 'Chart',
      plugin: {
        name: 'redistimeseries',
        internal: true,
        baseUrl: '/plugins/redistimeseries',
        scriptSrc: '/plugins/redistimeseries/index.js',
        stylesSrc: '/plugins/redistimeseries/styles.css',
      },
      activationMethod: 'renderChart',
      matchCommands: ['TS.RANGE', 'TS.MRANGE', 'TS.REVRANGE', 'TS.MREVRANGE'],
      default: true,
    }

    const setupTsVisualization = () => {
      // eslint-disable-next-line global-require
      const { appPluginsSelector } = require('uiSrc/slices/app/plugins')
      ;(appPluginsSelector as jest.Mock).mockReturnValue({
        visualizations: [tsVisualization],
        staticPath: '/static',
      })
      store.getState().connections.instances.connectedInstance.modules = [
        { name: 'timeseries' },
      ]
    }

    afterEach(() => {
      // eslint-disable-next-line global-require
      const { appPluginsSelector } = require('uiSrc/slices/app/plugins')
      ;(appPluginsSelector as jest.Mock).mockReturnValue({
        visualizations: [],
      })
      ;(getWbTsResultPreferences as jest.Mock).mockReturnValue(undefined)
    })

    it('should not persist view for non-TimeSeries commands', () => {
      renderQueryCardComponent({
        command: 'GET key',
        result: mockResult,
      })

      expect(setWbTsResultPreferences).not.toHaveBeenCalled()
    })

    it('should display text result when persisted preference is text', () => {
      setupTsVisualization()
      ;(getWbTsResultPreferences as jest.Mock).mockReturnValue({
        selectedView: 'text',
      })

      const { queryByTestId } = renderQueryCardComponent({
        command: 'TS.RANGE key - +',
        result: mockResult,
        isOpen: true,
      })

      expect(queryByTestId('query-cli-result')).toBeInTheDocument()
      expect(queryByTestId('query-plugin-result')).not.toBeInTheDocument()
    })

    it('should display plugin view when persisted preference is plugin', () => {
      setupTsVisualization()
      ;(getWbTsResultPreferences as jest.Mock).mockReturnValue({
        selectedView: 'plugin:redistimeseries-chart',
      })

      const { queryByTestId } = renderQueryCardComponent({
        command: 'TS.RANGE key - +',
        result: mockResult,
        isOpen: true,
      })

      expect(queryByTestId('query-plugin-result')).toBeInTheDocument()
      expect(queryByTestId('query-cli-result')).not.toBeInTheDocument()
    })
  })
})
