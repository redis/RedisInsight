import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { LongTermMemoryRecord } from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import LongTermOverviewPanel from './LongTermOverviewPanel'

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

describe('LongTermOverviewPanel', () => {
  const renderComponent = (stateOverrides: StateOverrides = {}) => {
    const store = createStore(stateOverrides)

    return {
      store,
      ...render(<LongTermOverviewPanel endpointId="endpoint-1" />, { store }),
    }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render compact cards from the store with the record count', () => {
    const memories = [buildMemory(), buildMemory()]
    renderComponent({ data: memories })

    expect(screen.getAllByTestId('long-term-overview-card')).toHaveLength(2)
    expect(screen.getByText(memories[0].text)).toBeInTheDocument()
    expect(screen.getByText(memories[1].text)).toBeInTheDocument()
    expect(screen.getByText('2 records')).toBeInTheDocument()
  })

  it('should render every record, newest first', () => {
    const memories = Array.from({ length: 10 }, (_, index) =>
      buildMemory({
        createdAt: new Date(2026, 0, index + 1).toISOString(),
      }),
    )
    renderComponent({ data: memories })

    const cards = screen.getAllByTestId('long-term-overview-card')
    expect(cards).toHaveLength(10)
    expect(cards[0]).toHaveTextContent(memories[9].text)
    expect(cards[9]).toHaveTextContent(memories[0].text)
    expect(screen.getByText('10 records')).toBeInTheDocument()
  })

  it('should render empty state when there are no memories', () => {
    renderComponent()

    expect(screen.getByTestId('long-term-overview-empty')).toHaveTextContent(
      'No long-term memories for the selected scope yet.',
    )
  })

  it('should render the error message when the store has an error', () => {
    const error = faker.lorem.sentence()
    renderComponent({ error })

    expect(screen.getByTestId('long-term-overview-error')).toHaveTextContent(
      error,
    )
  })
})
