import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import {
  clearLtmFilters,
  setLongTermMemorySearch,
  setOptimizeQuery,
  toggleEntityFilter,
  toggleMemoryTypeFilter,
  toggleSessionFilter,
  toggleTopicFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  AgentMemoryCapabilities,
  LongTermMemoryRecord,
} from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import LongTermMemoryPanel, {
  LongTermMemoryPanelProps,
} from './LongTermMemoryPanel'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  fetchLongTermMemoryAction: jest.fn(() => ({ type: 'FETCH_LTM' })),
}))

const mockedCapabilities: AgentMemoryCapabilities = {
  namespaces: true,
  optimizeQuery: true,
  summaryViews: true,
  addEvents: true,
}

const buildMemory = (
  overrides: Partial<LongTermMemoryRecord> = {},
): LongTermMemoryRecord => ({
  id: faker.string.uuid(),
  text: faker.lorem.sentence(),
  topics: [],
  entities: [],
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
})

interface StateOverrides {
  data?: LongTermMemoryRecord[]
  error?: string
  search?: string
  optimizeQuery?: boolean
  topics?: string[]
  entities?: string[]
  sessionIds?: string[]
  memoryTypes?: string[]
  sessions?: string[]
  capabilities?: AgentMemoryCapabilities | null
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState
  const { workspace } = state.agentMemory

  workspace.longTermMemory = {
    ...workspace.longTermMemory,
    data: overrides.data ?? [],
    error: overrides.error ?? '',
    search: overrides.search ?? '',
    optimizeQuery: overrides.optimizeQuery ?? false,
    topics: overrides.topics ?? [],
    entities: overrides.entities ?? [],
    sessionIds: overrides.sessionIds ?? [],
    memoryTypes: overrides.memoryTypes ?? [],
  }
  workspace.filters.sessions = overrides.sessions ?? []

  state.agentMemory.endpoints.connectedEndpoint.capabilities =
    overrides.capabilities === undefined
      ? mockedCapabilities
      : overrides.capabilities

  return mockStore(state)
}

describe('LongTermMemoryPanel', () => {
  const defaultProps: LongTermMemoryPanelProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (
    propsOverride?: Partial<LongTermMemoryPanelProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return { store, ...render(<LongTermMemoryPanel {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render memory cards from the store', () => {
    const memories = [buildMemory(), buildMemory()]
    renderComponent(undefined, { data: memories })

    expect(screen.getAllByTestId('long-term-memory-card')).toHaveLength(2)
    expect(screen.getByText(memories[0].text)).toBeInTheDocument()
    expect(screen.getByText(memories[1].text)).toBeInTheDocument()
    expect(screen.getByText('2 results')).toBeInTheDocument()
  })

  it('should render empty state when there are no memories', () => {
    renderComponent()

    expect(screen.getByTestId('long-term-memory-empty')).toHaveTextContent(
      'No long-term memories found for the current filters.',
    )
  })

  it('should dispatch toggleTopicFilter when a topic chip is clicked', () => {
    const topic = faker.lorem.word()
    const { store } = renderComponent(undefined, {
      data: [buildMemory({ topics: [topic] })],
    })

    fireEvent.click(screen.getByTestId(`topic-chip-${topic}`))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([toggleTopicFilter(topic)]),
    )
  })

  it('should dispatch toggleEntityFilter when an entity chip is clicked', () => {
    const entity = faker.lorem.word()
    const { store } = renderComponent(undefined, {
      data: [buildMemory({ entities: [entity] })],
    })

    fireEvent.click(screen.getByTestId(`entity-chip-${entity}`))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([toggleEntityFilter(entity)]),
    )
  })

  it('should dispatch toggleSessionFilter when a card session id is clicked', () => {
    const sessionId = 'sess-1'
    const { store } = renderComponent(undefined, {
      data: [buildMemory({ sessionId })],
    })

    fireEvent.click(screen.getByTestId(`session-filter-${sessionId}`))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([toggleSessionFilter(sessionId)]),
    )
  })

  it('should render the sessions, type, topics and entities filter dropdowns', () => {
    renderComponent()

    expect(screen.getByTestId('ltm-filter-sessions')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-type')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-topics')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-filter-entities')).toBeInTheDocument()
  })

  describe('active filter pills', () => {
    it('should not render the pill row when no filters are active', () => {
      renderComponent()

      expect(screen.queryByTestId('active-chip-filters')).toBeNull()
    })

    it('should render one pill per active filter of every kind', () => {
      renderComponent(undefined, {
        sessionIds: ['sess-1'],
        memoryTypes: ['semantic'],
        topics: ['travel'],
        entities: ['Paris'],
      })

      const pills = screen.getByTestId('active-chip-filters')

      expect(pills).toHaveTextContent('session: sess-1')
      expect(pills).toHaveTextContent('type: semantic')
      expect(pills).toHaveTextContent('topic: travel')
      expect(pills).toHaveTextContent('entity: Paris')
    })

    it('should dispatch toggleSessionFilter when a session pill is removed', () => {
      const { store } = renderComponent(undefined, { sessionIds: ['sess-1'] })

      fireEvent.click(screen.getByLabelText('Remove filter session: sess-1'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleSessionFilter('sess-1')]),
      )
    })

    it('should dispatch toggleMemoryTypeFilter when a type pill is removed', () => {
      const { store } = renderComponent(undefined, {
        memoryTypes: ['episodic'],
      })

      fireEvent.click(screen.getByLabelText('Remove filter type: episodic'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleMemoryTypeFilter('episodic')]),
      )
    })

    it('should dispatch toggleTopicFilter when a topic pill is removed', () => {
      const { store } = renderComponent(undefined, { topics: ['travel'] })

      fireEvent.click(screen.getByLabelText('Remove filter topic: travel'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleTopicFilter('travel')]),
      )
    })

    it('should dispatch toggleEntityFilter when an entity pill is removed', () => {
      const { store } = renderComponent(undefined, { entities: ['Paris'] })

      fireEvent.click(screen.getByLabelText('Remove filter entity: Paris'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([toggleEntityFilter('Paris')]),
      )
    })

    it('should dispatch clearLtmFilters when clear all is clicked', () => {
      const { store } = renderComponent(undefined, {
        topics: [faker.lorem.word()],
        entities: [faker.lorem.word()],
      })

      expect(screen.getByTestId('active-chip-filters')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('clear-chip-filters'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([clearLtmFilters()]),
      )
    })
  })

  it('should dispatch setLongTermMemorySearch when typing in the search input', () => {
    const query = faker.lorem.word()
    const { store } = renderComponent()

    fireEvent.change(screen.getByTestId('long-term-memory-search'), {
      target: { value: query },
    })

    expect(store.getActions()).toEqual(
      expect.arrayContaining([setLongTermMemorySearch(query)]),
    )
  })

  describe('optimize query', () => {
    it('should dispatch setOptimizeQuery when the checkbox is toggled', () => {
      const { store } = renderComponent()

      fireEvent.click(screen.getByTestId('long-term-memory-optimize-query'))

      expect(store.getActions()).toEqual(
        expect.arrayContaining([setOptimizeQuery(true)]),
      )
    })

    it('should not render the checkbox when the capability is missing', () => {
      renderComponent(undefined, {
        capabilities: { ...mockedCapabilities, optimizeQuery: false },
      })

      expect(screen.queryByTestId('long-term-memory-optimize-query')).toBeNull()
    })
  })

  it('should render the error message when the store has an error', () => {
    const error = faker.lorem.sentence()
    renderComponent(undefined, { error })

    expect(screen.getByTestId('long-term-memory-error')).toHaveTextContent(
      error,
    )
  })
})
