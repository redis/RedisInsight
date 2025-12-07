import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { FeatureFlags } from 'uiSrc/constants'
import Actions, { Props } from './Actions'

const mockedProps: Props = {
  handleBulkActionsPanel: jest.fn,
  handleAddKeyPanel: jest.fn,
}
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
})
