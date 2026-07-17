import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { clearWorkingMemoryAction } from 'uiSrc/slices/agentMemory/workspace'
import {
  AgentMemoryCapabilities,
  AgentMemoryMessage,
  WorkingMemory,
} from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  within,
} from 'uiSrc/utils/test-utils'

import WorkingMemoryPanel, {
  WorkingMemoryPanelProps,
} from './WorkingMemoryPanel'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  clearWorkingMemoryAction: jest.fn(() => ({ type: 'CLEAR_WORKING_MEMORY' })),
  fetchWorkingMemoryAction: jest.fn(() => ({ type: 'FETCH_WM' })),
}))

const mockedSessionId = faker.string.uuid()

const mockedCapabilities: AgentMemoryCapabilities = {
  namespaces: true,
  optimizeQuery: true,
  summaryViews: true,
  addEvents: true,
}

const buildMessage = (
  overrides: Partial<AgentMemoryMessage> = {},
): AgentMemoryMessage => ({
  id: faker.string.uuid(),
  role: 'user',
  content: faker.lorem.sentence(),
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
})

interface StateOverrides {
  sessionId?: string | null
  data?: WorkingMemory | null
  error?: string
  capabilities?: AgentMemoryCapabilities | null
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.filters.sessionId =
    overrides.sessionId === undefined ? mockedSessionId : overrides.sessionId
  state.agentMemory.workspace.workingMemory.data = overrides.data ?? null
  state.agentMemory.workspace.workingMemory.error = overrides.error ?? ''
  state.agentMemory.endpoints.connectedEndpoint.capabilities =
    overrides.capabilities === undefined
      ? mockedCapabilities
      : overrides.capabilities

  return mockStore(state)
}

describe('WorkingMemoryPanel', () => {
  const defaultProps: WorkingMemoryPanelProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (
    propsOverride?: Partial<WorkingMemoryPanelProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return { store, ...render(<WorkingMemoryPanel {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render messages from the store with their role tags', () => {
    const messages = [
      buildMessage({ role: 'user' }),
      buildMessage({ role: 'assistant' }),
    ]
    renderComponent(undefined, {
      data: { sessionId: mockedSessionId, messages },
    })

    const cards = screen.getAllByTestId('working-memory-message')

    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByText('user')).toBeInTheDocument()
    expect(within(cards[0]).getByText(messages[0].content)).toBeInTheDocument()
    expect(within(cards[1]).getByText('assistant')).toBeInTheDocument()
    expect(within(cards[1]).getByText(messages[1].content)).toBeInTheDocument()
    expect(screen.getByText('2 messages')).toBeInTheDocument()
  })

  it('should render empty state when the session has no messages', () => {
    renderComponent(undefined, {
      data: { sessionId: mockedSessionId, messages: [] },
    })

    expect(screen.getByTestId('working-memory-empty')).toHaveTextContent(
      'No messages in working memory yet.',
    )
  })

  it('should render empty state and no clear control when no session is selected', () => {
    renderComponent(undefined, { sessionId: null })

    expect(screen.getByTestId('working-memory-empty')).toHaveTextContent(
      'Pick a session to inspect its working memory.',
    )
    expect(screen.getByText('no session selected')).toBeInTheDocument()
    expect(screen.queryByTestId('working-memory-clear-icon')).toBeNull()
  })

  it('should dispatch clearWorkingMemoryAction when clear is confirmed', async () => {
    const { store } = renderComponent(undefined, {
      data: { sessionId: mockedSessionId, messages: [buildMessage()] },
    })

    fireEvent.click(screen.getByTestId('working-memory-clear-icon'))
    fireEvent.click(await screen.findByTestId('working-memory-clear'))

    expect(clearWorkingMemoryAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      expect.any(Function),
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'CLEAR_WORKING_MEMORY' }]),
    )
  })

  it('should render the running summary when present', () => {
    const summary = faker.lorem.paragraph()
    renderComponent(undefined, {
      data: { sessionId: mockedSessionId, messages: [], summary },
    })

    expect(screen.getByTestId('working-memory-summary')).toHaveTextContent(
      summary,
    )
  })

  it('should not render the running summary block when absent', () => {
    renderComponent(undefined, {
      data: { sessionId: mockedSessionId, messages: [] },
    })

    expect(screen.queryByTestId('working-memory-summary')).toBeNull()
  })

  it('should render the error message when the store has an error', () => {
    const error = faker.lorem.sentence()
    renderComponent(undefined, { error })

    expect(screen.getByTestId('working-memory-error')).toHaveTextContent(error)
  })

  describe('add event', () => {
    it('should render the add event button when the endpoint supports it', () => {
      renderComponent()

      expect(screen.getByTestId('working-memory-add-event')).toBeInTheDocument()
    })

    it('should not render the add event button without the addEvents capability', () => {
      renderComponent(undefined, {
        capabilities: { ...mockedCapabilities, addEvents: false },
      })

      expect(screen.queryByTestId('working-memory-add-event')).toBeNull()
    })

    it('should not render the add event button when capabilities are unknown', () => {
      renderComponent(undefined, { capabilities: null })

      expect(screen.queryByTestId('working-memory-add-event')).toBeNull()
    })

    it('should open the add event dialog when the button is clicked', async () => {
      renderComponent()

      fireEvent.click(screen.getByTestId('working-memory-add-event'))

      expect(await screen.findByTestId('add-event-dialog')).toBeInTheDocument()
    })
  })
})
