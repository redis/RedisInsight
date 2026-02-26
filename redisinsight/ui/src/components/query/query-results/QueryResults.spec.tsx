import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { QueryResultsProvider } from '../context/query-results.context'
import QueryResults, { QueryResultsProps } from './QueryResults'

const mockedProps = mock<QueryResultsProps>()

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
    visualizations: [],
  }),
}))

const mockItems = [
  commandExecutionUIFactory.build({
    id: '1',
    command: 'SET key value',
    isOpen: false,
  }),
  commandExecutionUIFactory.build({
    id: '2',
    command: 'GET key',
    isOpen: true,
  }),
]

const renderQueryResults = (props: Partial<QueryResultsProps> = {}) => {
  const defaultProps: QueryResultsProps = {
    ...instance(mockedProps),
    isResultsLoaded: true,
    items: [],
    clearing: false,
    processing: false,
    activeMode: RunQueryMode.ASCII,
    scrollDivRef: React.createRef(),
    onQueryReRun: jest.fn(),
    onQueryDelete: jest.fn(),
    onAllQueriesDelete: jest.fn(),
    onQueryProfile: jest.fn(),
    ...props,
  }

  return render(
    <QueryResultsProvider telemetry={{}}>
      <QueryResults {...defaultProps} />
    </QueryResultsProvider>,
    {
      store,
    },
  )
}

describe('QueryResults', () => {
  it('should render', () => {
    expect(renderQueryResults()).toBeTruthy()
  })

  it('should render query-results container', () => {
    renderQueryResults()
    expect(screen.getByTestId('query-results')).toBeInTheDocument()
  })

  it('should render progress bar when results are not loaded', () => {
    renderQueryResults({ isResultsLoaded: false })
    expect(screen.getByTestId('progress-results-history')).toBeInTheDocument()
  })

  it('should not render progress bar when results are loaded', () => {
    renderQueryResults({ isResultsLoaded: true })
    expect(
      screen.queryByTestId('progress-results-history'),
    ).not.toBeInTheDocument()
  })

  it('should render clear results button when items exist', () => {
    renderQueryResults({ items: mockItems })
    expect(screen.getByTestId('clear-history-btn')).toBeInTheDocument()
  })

  it('should not render clear results button when no items', () => {
    renderQueryResults({ items: [] })
    expect(screen.queryByTestId('clear-history-btn')).not.toBeInTheDocument()
  })

  it('should call onAllQueriesDelete when clear results button is clicked', () => {
    const onAllQueriesDelete = jest.fn()
    renderQueryResults({ items: mockItems, onAllQueriesDelete })

    fireEvent.click(screen.getByTestId('clear-history-btn'))
    expect(onAllQueriesDelete).toHaveBeenCalled()
  })

  it('should disable clear results button when clearing', () => {
    renderQueryResults({ items: mockItems, clearing: true })
    expect(screen.getByTestId('clear-history-btn')).toBeDisabled()
  })

  it('should disable clear results button when processing', () => {
    renderQueryResults({ items: mockItems, processing: true })
    expect(screen.getByTestId('clear-history-btn')).toBeDisabled()
  })

  it('should render query cards for each item', () => {
    renderQueryResults({ items: mockItems })
    expect(screen.getByTestId('query-card-container-1')).toBeInTheDocument()
    expect(screen.getByTestId('query-card-container-2')).toBeInTheDocument()
  })

  it('should render no results placeholder when loaded with no items', () => {
    renderQueryResults({
      isResultsLoaded: true,
      items: [],
      noResultsPlaceholder: <div data-testid="no-results">No Results</div>,
    })

    expect(screen.getByTestId('no-results')).toBeInTheDocument()
  })

  it('should not render no results placeholder when items exist', () => {
    renderQueryResults({
      isResultsLoaded: true,
      items: mockItems,
      noResultsPlaceholder: <div data-testid="no-results">No Results</div>,
    })

    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument()
  })

  it('should not render no results placeholder when results are not loaded', () => {
    renderQueryResults({
      isResultsLoaded: false,
      items: [],
      noResultsPlaceholder: <div data-testid="no-results">No Results</div>,
    })

    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument()
  })
})
