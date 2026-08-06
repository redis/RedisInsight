import React from 'react'
import { cloneDeep } from 'lodash'

import type { RootState } from 'uiSrc/slices/store'
import {
  clearLtmFilters,
  setLongTermMemorySearch,
  setSimilarityThreshold,
  toggleMemoryTypeFilter,
  toggleSessionFilter,
  toggleTopicFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import LongTermMemoryToolbar from './LongTermMemoryToolbar'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  fetchLongTermMemoryAction: jest.fn(() => ({ type: 'FETCH_LTM' })),
}))

interface StateOverrides {
  search?: string
  topics?: string[]
  sessionIds?: string[]
  memoryTypes?: string[]
  namespaces?: string[]
  sessions?: string[]
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState
  const { workspace } = state.agentMemory

  workspace.longTermMemory = {
    ...workspace.longTermMemory,
    search: overrides.search ?? '',
    topics: overrides.topics ?? [],
    sessionIds: overrides.sessionIds ?? [],
    memoryTypes: overrides.memoryTypes ?? [],
    namespaces: overrides.namespaces ?? [],
  }
  workspace.filters.sessions = overrides.sessions ?? []

  return mockStore(state)
}

describe('LongTermMemoryToolbar', () => {
  const renderComponent = (stateOverrides: StateOverrides = {}) => {
    const store = createStore(stateOverrides)

    return { store, ...render(<LongTermMemoryToolbar />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the owner, namespaces, sessions, type and topics filter dropdowns', () => {
    renderComponent()

    expect(screen.getByTestId('ltm-filter-users')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-namespaces')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-sessions')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-type')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-topics')).toBeInTheDocument()
  })

  it('should dispatch setLongTermMemorySearch when typing in the search input', () => {
    const query = 'redis'
    const { store } = renderComponent()

    fireEvent.change(screen.getByTestId('long-term-memory-search'), {
      target: { value: query },
    })

    expect(store.getActions()).toEqual(
      expect.arrayContaining([setLongTermMemorySearch(query)]),
    )
  })

  it('should dispatch setSimilarityThreshold when the threshold input changes', () => {
    const { store } = renderComponent()

    fireEvent.change(screen.getByTestId('ltm-similarity-threshold'), {
      target: { value: '0.5' },
    })

    expect(store.getActions()).toEqual(
      expect.arrayContaining([setSimilarityThreshold(0.5)]),
    )
  })

  describe('active filter pills', () => {
    it('should not render the pill row when no filters are active', () => {
      renderComponent()

      expect(screen.queryByTestId('active-chip-filters')).toBeNull()
    })

    it('should render one pill per active filter of every kind', () => {
      renderComponent({
        sessionIds: ['sess-1'],
        memoryTypes: ['semantic'],
        topics: ['travel'],
        namespaces: ['demo'],
      })

      const pills = screen.getByTestId('active-chip-filters')

      expect(pills).toHaveTextContent('session: sess-1')
      expect(pills).toHaveTextContent('type: semantic')
      expect(pills).toHaveTextContent('topic: travel')
      expect(pills).toHaveTextContent('namespace: demo')
    })

    it('should dispatch toggleSessionFilter when a session pill is removed', () => {
      const { store } = renderComponent({ sessionIds: ['sess-1'] })

      fireEvent.click(screen.getByLabelText('Remove filter session: sess-1'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleSessionFilter('sess-1')]),
      )
    })

    it('should dispatch toggleMemoryTypeFilter when a type pill is removed', () => {
      const { store } = renderComponent({ memoryTypes: ['episodic'] })

      fireEvent.click(screen.getByLabelText('Remove filter type: episodic'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleMemoryTypeFilter('episodic')]),
      )
    })

    it('should dispatch toggleTopicFilter when a topic pill is removed', () => {
      const { store } = renderComponent({ topics: ['travel'] })

      fireEvent.click(screen.getByLabelText('Remove filter topic: travel'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleTopicFilter('travel')]),
      )
    })

    it('should dispatch clearLtmFilters when clear all is clicked', () => {
      const { store } = renderComponent({ topics: ['travel'] })

      expect(screen.getByTestId('active-chip-filters')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('clear-chip-filters'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([clearLtmFilters()]),
      )
    })
  })
})
