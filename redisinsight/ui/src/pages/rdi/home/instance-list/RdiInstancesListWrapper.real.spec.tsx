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
import RdiInstancesListWrapper from './RdiInstancesListWrapper'
import { rdiInstanceFactory } from 'uiSrc/mocks/rdi/RdiInstance.factory'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  instancesSelector: jest.fn(),
}))

const mockInstances = rdiInstanceFactory.buildList(2)

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
    const deleteButton = screen.getByTestId(
      `delete-instance-${mockInstances[0].id}-icon`,
    )

    await act(async () => {
      fireEvent.click(deleteButton)
    })

    // Check that the popover is visible with the confirmation content
    expect(
      screen.getByText('will be removed from RedisInsight.'),
    ).toBeInTheDocument()
    // Check that the instance name appears in the popover (there should be multiple instances, but we just need one)
    expect(screen.getAllByText(mockInstances[0].name).length).toBeGreaterThan(0)
    expect(
      screen.getByTestId(`delete-instance-${mockInstances[0].id}`),
    ).toBeInTheDocument()
  })
})
