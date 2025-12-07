import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import RunConfirmationPopover from './RunConfirmationPopover'

describe('RunConfirmationPopover', () => {
  it('should render', () => {
    expect(render(<RunConfirmationPopover onApply={jest.fn()} />)).toBeTruthy()
  })

  it('should hide "Change Database" button when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<RunConfirmationPopover onApply={jest.fn()} />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByRole('button', { name: 'Change Database' }),
    ).toBeInTheDocument()
  })

  it('should hide "Change Database" button when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<RunConfirmationPopover onApply={jest.fn()} />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByRole('button', { name: 'Change Database' }),
    ).not.toBeInTheDocument()
  })
})
