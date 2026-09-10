import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { LongTermMemoryRecord } from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { updateLongTermMemoryAction } from 'uiSrc/slices/agentMemory/workspace'
import LongTermMemoryDetails, {
  LongTermMemoryDetailsProps,
} from './LongTermMemoryDetails'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  updateLongTermMemoryAction: jest.fn(() => ({ type: 'UPDATE_LTM' })),
  deleteLongTermMemoryAction: jest.fn(() => ({ type: 'DELETE_LTM' })),
}))

const mockRecord: LongTermMemoryRecord = {
  id: 'memory-1',
  text: 'user prefers redis',
  memoryType: 'semantic',
  userId: 'user-1',
  sessionId: 'session-1',
  namespace: 'demo',
  topics: ['databases', 'preferences'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

interface StateOverrides {
  record?: LongTermMemoryRecord | null
}

const createStore = ({ record = mockRecord }: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState
  state.agentMemory.workspace.longTermMemory.data = record ? [record] : []
  state.agentMemory.workspace.longTermMemory.selectedRecordId =
    record?.id ?? null
  return mockStore(state)
}

describe('LongTermMemoryDetails', () => {
  const defaultProps: LongTermMemoryDetailsProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (stateOverrides: StateOverrides = {}) => {
    const store = createStore(stateOverrides)
    return {
      store,
      ...render(<LongTermMemoryDetails {...defaultProps} />, { store }),
    }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render every field of the selected record', () => {
    renderComponent()

    expect(screen.getByTestId('ltm-details-panel')).toBeInTheDocument()
    expect(screen.getByTestId('ltm-field-text')).toHaveTextContent(
      'user prefers redis',
    )
    expect(screen.getByTestId('ltm-field-memoryType')).toHaveTextContent(
      'semantic',
    )
    expect(screen.getByTestId('ltm-field-topics')).toHaveTextContent(
      'databases, preferences',
    )
    expect(screen.getByTestId('ltm-field-userId')).toHaveTextContent('user-1')
    expect(screen.getByTestId('ltm-field-sessionId')).toHaveTextContent(
      'session-1',
    )
    expect(screen.getByTestId('ltm-field-namespace')).toHaveTextContent('demo')
  })

  it('should show the empty state when no record is selected', () => {
    renderComponent({ record: null })

    expect(screen.getByTestId('ltm-details-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('ltm-field-text')).toBeNull()
  })

  it('should edit the text field via a textarea and dispatch an update', () => {
    renderComponent()

    expect(screen.queryByTestId('ltm-text-editor')).toBeNull()

    fireEvent.click(screen.getByTestId('ltm-text-edit'))

    const textarea = screen.getByTestId('ltm-text-editor')
    fireEvent.change(textarea, { target: { value: 'user loves redis' } })
    fireEvent.click(screen.getByTestId('ltm-text-apply'))

    expect(updateLongTermMemoryAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      'memory-1',
      { text: 'user loves redis' },
      expect.any(Function),
    )
  })

  it('should clear the selection when the close button is clicked', () => {
    const { store } = renderComponent()

    fireEvent.click(screen.getByTestId('ltm-details-close'))

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        { type: 'agentMemoryWorkspace/setSelectedRecord', payload: null },
      ]),
    )
  })
})
