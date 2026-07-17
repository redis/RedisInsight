import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { addSessionEventAction } from 'uiSrc/slices/agentMemory/workspace'
import { AgentMemoryBackendType } from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  userEvent,
  waitFor,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'

import AddEventDialog, { AddEventDialogProps } from './AddEventDialog'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  addSessionEventAction: jest.fn(() => ({ type: 'ADD_SESSION_EVENT' })),
}))

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

const mockedSessionId = faker.string.uuid()

interface StateOverrides {
  sessionId?: string | null
  backendType?: AgentMemoryBackendType
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.filters.sessionId =
    overrides.sessionId === undefined ? mockedSessionId : overrides.sessionId
  state.agentMemory.endpoints.connectedEndpoint.backendType =
    overrides.backendType ?? AgentMemoryBackendType.Oss

  return mockStore(state)
}

describe('AddEventDialog', () => {
  const defaultProps: AddEventDialogProps = {
    endpointId: faker.string.uuid(),
    isOpen: true,
    onClose: jest.fn(),
  }

  const renderComponent = (
    propsOverride?: Partial<AddEventDialogProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return { store, ...render(<AddEventDialog {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render session, role and content fields when open', () => {
    renderComponent()

    expect(screen.getByTestId('add-event-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('add-event-session-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-event-role-select')).toBeInTheDocument()
    expect(screen.getByTestId('add-event-content-input')).toBeInTheDocument()
  })

  it('should render nothing when closed', () => {
    renderComponent({ isOpen: false })

    expect(screen.queryByTestId('add-event-dialog')).toBeNull()
  })

  it('should prefill the session from the connected session filter', () => {
    renderComponent()

    expect(screen.getByTestId('add-event-session-input')).toHaveValue(
      mockedSessionId,
    )
  })

  it('should leave the session empty when no session is connected', () => {
    renderComponent(undefined, { sessionId: null })

    expect(screen.getByTestId('add-event-session-input')).toHaveValue('')
  })

  it('should disable submit until both session and content are provided', () => {
    renderComponent()

    expect(screen.getByTestId('add-event-submit-button')).toBeDisabled()

    fireEvent.change(screen.getByTestId('add-event-content-input'), {
      target: { value: faker.lorem.sentence() },
    })

    expect(screen.getByTestId('add-event-submit-button')).not.toBeDisabled()
  })

  it('should keep submit disabled when the session is blank', () => {
    renderComponent(undefined, { sessionId: null })

    fireEvent.change(screen.getByTestId('add-event-content-input'), {
      target: { value: faker.lorem.sentence() },
    })

    expect(screen.getByTestId('add-event-submit-button')).toBeDisabled()
  })

  it('should dispatch addSessionEventAction with trimmed values on submit', async () => {
    const sessionId = faker.string.uuid()
    const content = faker.lorem.sentence()
    const { store } = renderComponent()

    fireEvent.change(screen.getByTestId('add-event-session-input'), {
      target: { value: `  ${sessionId}  ` },
    })
    fireEvent.change(screen.getByTestId('add-event-content-input'), {
      target: { value: `  ${content}  ` },
    })
    fireEvent.click(screen.getByTestId('add-event-submit-button'))

    expect(addSessionEventAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      { sessionId, role: 'user', content },
      expect.any(Function),
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'ADD_SESSION_EVENT' }]),
    )
    // submit is awaited - wait for isSubmitting to be released
    await waitFor(() =>
      expect(screen.getByTestId('add-event-submit-button')).not.toBeDisabled(),
    )
  })

  describe('role options', () => {
    it('should offer the tool role for an oss backend', async () => {
      renderComponent(undefined, { backendType: AgentMemoryBackendType.Oss })

      await userEvent.click(screen.getByTestId('add-event-role-select'))
      await waitForRedisUiSelectVisible()

      expect(screen.getByText('assistant')).toBeInTheDocument()
      expect(screen.getByText('system')).toBeInTheDocument()
      expect(screen.getByText('tool')).toBeInTheDocument()
    })

    it('should not offer the tool role for a cloud backend', async () => {
      renderComponent(undefined, { backendType: AgentMemoryBackendType.Cloud })

      await userEvent.click(screen.getByTestId('add-event-role-select'))
      await waitForRedisUiSelectVisible()

      expect(screen.getByText('assistant')).toBeInTheDocument()
      expect(screen.getByText('system')).toBeInTheDocument()
      expect(screen.queryByText('tool')).toBeNull()
    })
  })

  it('should call onClose when cancel is clicked', () => {
    const onClose = jest.fn()
    renderComponent({ onClose })

    fireEvent.click(screen.getByTestId('add-event-cancel-button'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
