import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import {
  changeScopeAction,
  setSessionId,
} from 'uiSrc/slices/agentMemory/workspace'
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
const mockedSessions = ['session-1', 'session-2']

interface StateOverrides {
  users?: string[]
  sessions?: string[]
  userId?: string | null
  sessionId?: string | null
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.filters = {
    ...state.agentMemory.workspace.filters,
    users: overrides.users ?? mockedUsers,
    sessions: overrides.sessions ?? mockedSessions,
    userId: overrides.userId ?? mockedUsers[0],
    sessionId: overrides.sessionId ?? mockedSessions[0],
  }

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

  it('should render owner and session selects', () => {
    renderComponent()

    expect(screen.getByTestId('agent-memory-user-select')).toBeInTheDocument()
    expect(
      screen.getByTestId('agent-memory-session-select'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('agent-memory-namespace-select')).toBeNull()
  })

  it('should render the selected filter values from the store', () => {
    renderComponent()

    expect(screen.getByText(mockedUsers[0])).toBeInTheDocument()
    expect(screen.getByText(mockedSessions[0])).toBeInTheDocument()
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
