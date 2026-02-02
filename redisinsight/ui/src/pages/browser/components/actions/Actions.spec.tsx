import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  setBulkActionType,
  setBulkDeleteFilter,
  setBulkDeleteKeyCount,
  setBulkDeleteSearch,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType, FeatureFlags, KeyTypes } from 'uiSrc/constants'
import Actions, { Props } from './Actions'

let store: typeof mockedStore

const mockedProps: Props = {
  handleBulkActionsPanel: jest.fn(),
  handleAddKeyPanel: jest.fn(),
}

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Actions', () => {
  it('should render', () => {
    expect(render(<Actions {...mockedProps} />)).toBeTruthy()

    // Verify the buttons are present
    const bulkActionsButton = screen.getByTestId('btn-bulk-actions')
    const addKeyButton = screen.getByTestId('btn-add-key')

    expect(bulkActionsButton).toBeInTheDocument()
    expect(addKeyButton).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<Actions {...mockedProps} />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('btn-bulk-actions')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<Actions {...mockedProps} />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('btn-bulk-actions')).not.toBeInTheDocument()
  })

  it('should dispatch bulk delete state sync actions when clicking bulk actions button', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      'browser.keys',
      {
        ...initialStateDefault.browser.keys,
        search: 'user:*',
        filter: KeyTypes.Hash,
      },
    )

    const testStore = mockStore(initialStoreState)
    const handleBulkActionsPanel = jest.fn()
    render(
      <Actions
        {...mockedProps}
        handleBulkActionsPanel={handleBulkActionsPanel}
      />,
      { store: testStore },
    )

    fireEvent.click(screen.getByTestId('btn-bulk-actions'))

    const expectedActions = [
      setBulkDeleteSearch('user:*'),
      setBulkDeleteFilter(KeyTypes.Hash),
      setBulkDeleteKeyCount(null),
      setBulkActionType(BulkActionsType.Delete),
    ]

    expect(testStore.getActions()).toEqual(
      expect.arrayContaining(expectedActions),
    )
    expect(handleBulkActionsPanel).toHaveBeenCalledWith(true)
  })
})
