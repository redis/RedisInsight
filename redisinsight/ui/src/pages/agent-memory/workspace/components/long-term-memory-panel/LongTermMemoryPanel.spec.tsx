import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import {
  toggleSessionFilter,
  toggleTopicFilter,
} from 'uiSrc/slices/agentMemory/workspace'
import { LongTermMemoryRecord } from 'uiSrc/slices/interfaces/agentMemory'
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

const buildMemory = (
  overrides: Partial<LongTermMemoryRecord> = {},
): LongTermMemoryRecord => ({
  id: faker.string.uuid(),
  text: faker.lorem.sentence(),
  topics: [],
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
})

interface StateOverrides {
  data?: LongTermMemoryRecord[]
  error?: string
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.longTermMemory = {
    ...state.agentMemory.workspace.longTermMemory,
    data: overrides.data ?? [],
    error: overrides.error ?? '',
  }

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

  it('should render the error message when the store has an error', () => {
    const error = faker.lorem.sentence()
    renderComponent(undefined, { error })

    expect(screen.getByTestId('long-term-memory-error')).toHaveTextContent(
      error,
    )
  })
})
