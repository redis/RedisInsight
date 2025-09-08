import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import RdiInstancesListWrapper from './RdiInstancesListWrapper'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  instancesSelector: jest.fn(),
}))

const mockInstances: RdiInstance[] = [
  {
    id: '1',
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date(),
    version: '1.2',
    error: '',
    loading: false,
  },
  {
    id: '2',
    name: 'My second integration',
    url: 'redis-67890.c253.us-central1-1.gce.cloud.redislabs.com:67890',
    lastConnection: new Date(),
    version: '1.3',
    error: '',
    loading: false,
  },
]

const mockSelectorData = {
  loading: false,
  error: '',
  data: mockInstances,
  connectedInstance: {
    id: '',
    name: '',
    url: '',
    lastConnection: null,
    version: '',
    error: '',
    loading: false,
  },
  loadingChanging: false,
  errorChanging: '',
  changedSuccessfully: false,
  isPipelineLoaded: false,
}

let store: typeof mockedStore

describe('RdiInstancesListWrapper', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
    ;(instancesSelector as jest.Mock).mockReturnValue({
      ...mockSelectorData,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show confirmation popover when click on delete', async () => {
    const mockProps = {
      width: 1200,
      editedInstance: null,
      onEditInstance: jest.fn(),
      onDeleteInstances: jest.fn(),
    }

    render(<RdiInstancesListWrapper {...mockProps} />, { store })

    // Find and click the delete button for the first instance
    const deleteButton = screen.getByTestId('delete-instance-1-icon')

    await act(async () => {
      fireEvent.click(deleteButton)
    })

    // Check that the popover is visible with the confirmation content
    expect(screen.getByText('will be removed from RedisInsight.')).toBeInTheDocument()
    // Check that the instance name appears in the popover (there should be multiple instances, but we just need one)
    expect(screen.getAllByText('My first integration').length).toBeGreaterThan(0)
    expect(screen.getByTestId('delete-instance-1')).toBeInTheDocument()
  })
})
