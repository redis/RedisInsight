import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'

import { FeatureFlags } from 'uiSrc/constants'
import OAuthRecommendedSettings from './OAuthRecommendedSettings'

describe('OAuthRecommendedSettings', () => {
  it('should render', () => {
    expect(
      render(<OAuthRecommendedSettings value onChange={jest.fn} />),
    ).toBeTruthy()
  })

  it('should call onChange after change value', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSsoRecommendedSettings}`,
      { flag: true },
    )
    const onChange = jest.fn()
    render(<OAuthRecommendedSettings value onChange={onChange} />, {
      store: mockStore(initialStoreState),
    })

    fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))

    expect(onChange).toBeCalledWith(false)
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSsoRecommendedSettings}`,
      { flag: true },
    )

    render(<OAuthRecommendedSettings value onChange={jest.fn} />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('oauth-recommended-settings-checkbox'),
    ).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSsoRecommendedSettings}`,
      { flag: false },
    )

    render(<OAuthRecommendedSettings value onChange={jest.fn} />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('oauth-recommended-settings-checkbox'),
    ).not.toBeInTheDocument()
  })
})
