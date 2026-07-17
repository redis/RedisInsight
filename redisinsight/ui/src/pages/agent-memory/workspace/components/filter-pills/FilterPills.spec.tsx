import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import {
  changeScopeAction,
  setSessionId,
} from 'uiSrc/slices/agentMemory/workspace'
import { AgentMemoryCapabilities } from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
  userEvent,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'

import FilterPills, { FilterPillsProps } from './FilterPills'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  changeScopeAction: jest.fn(() => ({ type: 'CHANGE_SCOPE' })),
}))

const mockedUsers = ['alice', 'bob']
const mockedNamespaces = ['ns-1', 'ns-2']
const mockedSessions = ['session-1', 'session-2']

const mockedCapabilities: AgentMemoryCapabilities = {
  namespaces: true,
  optimizeQuery: false,
  summaryViews: false,
  addEvents: false,
}

interface StateOverrides {
  users?: string[]
  namespaces?: string[]
  sessions?: string[]
  userId?: string | null
  namespace?: string | null
  sessionId?: string | null
  capabilities?: AgentMemoryCapabilities | null
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.filters = {
    ...state.agentMemory.workspace.filters,
    users: overrides.users ?? mockedUsers,
    namespaces: overrides.namespaces ?? mockedNamespaces,
    sessions: overrides.sessions ?? mockedSessions,
    userId: overrides.userId ?? mockedUsers[0],
    namespace: overrides.namespace ?? mockedNamespaces[0],
    sessionId: overrides.sessionId ?? mockedSessions[0],
  }
  state.agentMemory.endpoints.connectedEndpoint.capabilities =
    overrides.capabilities === undefined
      ? mockedCapabilities
      : overrides.capabilities

  return mockStore(state)
}

describe('FilterPills', () => {
  const defaultProps: FilterPillsProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (
    propsOverride?: Partial<FilterPillsProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return { store, ...render(<FilterPills {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render namespace, user and session selects', () => {
    renderComponent()

    expect(
      screen.getByTestId('agent-memory-namespace-select'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('agent-memory-user-select')).toBeInTheDocument()
    expect(
      screen.getByTestId('agent-memory-session-select'),
    ).toBeInTheDocument()
  })

  it('should render the selected filter values from the store', () => {
    renderComponent()

    expect(screen.getByText(mockedUsers[0])).toBeInTheDocument()
    expect(screen.getByText(mockedNamespaces[0])).toBeInTheDocument()
    expect(screen.getByText(mockedSessions[0])).toBeInTheDocument()
  })

  it('should not render namespace select when endpoint has no namespaces capability', () => {
    renderComponent(undefined, {
      capabilities: { ...mockedCapabilities, namespaces: false },
    })

    expect(screen.queryByTestId('agent-memory-namespace-select')).toBeNull()
    expect(screen.getByTestId('agent-memory-user-select')).toBeInTheDocument()
  })

  it('should dispatch changeScopeAction when user is changed', async () => {
    const { store } = renderComponent()

    await userEvent.click(screen.getByTestId('agent-memory-user-select'))
    await waitForRedisUiSelectVisible()
    await userEvent.click(screen.getByText(mockedUsers[1]))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'CHANGE_SCOPE' }]),
    )
    expect(changeScopeAction).toHaveBeenCalledWith(defaultProps.endpointId, {
      userId: mockedUsers[1],
    })
  })

  it('should dispatch changeScopeAction with a null namespace when "(none)" is picked', async () => {
    const { store } = renderComponent()

    await userEvent.click(screen.getByTestId('agent-memory-namespace-select'))
    await waitForRedisUiSelectVisible()
    await userEvent.click(screen.getByText('(none)'))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'CHANGE_SCOPE' }]),
    )
    expect(changeScopeAction).toHaveBeenCalledWith(defaultProps.endpointId, {
      namespace: null,
    })
  })

  it('should dispatch setSessionId when session is changed', async () => {
    const { store } = renderComponent()

    await userEvent.click(screen.getByTestId('agent-memory-session-select'))
    await waitForRedisUiSelectVisible()
    await userEvent.click(screen.getByText(mockedSessions[1]))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([setSessionId(mockedSessions[1])]),
    )
    expect(changeScopeAction).not.toHaveBeenCalled()
  })
})
