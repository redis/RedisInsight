import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { OAuthSsoDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'

import { UpgradeRedisBanner } from './UpgradeRedisBanner'

const createTestStore = (featureFlagsEnabled = true) =>
  configureStore({
    reducer: combineReducers({
      connections: combineReducers({ cloud: cloudReducer }),
      oauth: combineReducers({ cloud: appOauthReducer }),
      app: combineReducers({ features: appFeaturesReducer }),
    }),
    preloadedState: {
      app: {
        features: {
          featureFlags: {
            features: {
              [FeatureFlags.cloudSso]: { flag: featureFlagsEnabled },
              [FeatureFlags.cloudAds]: { flag: featureFlagsEnabled },
            },
          },
        },
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })

const renderComponent = (featureFlagsEnabled = true) => {
  const store = createTestStore(featureFlagsEnabled)
  return render(
    <>
      <UpgradeRedisBanner />
      <OAuthSsoDialog />
    </>,
    { store },
  )
}

describe('UpgradeRedisBanner', () => {
  it('should render correctly', () => {
    renderComponent()

    const banner = screen.getByTestId('upgrade-redis-banner')
    expect(banner).toBeInTheDocument()
  })

  it('should display the upgrade message', () => {
    renderComponent()

    expect(screen.getByText(/Upgrade to Redis 7\.2\+/)).toBeInTheDocument()
  })

  it('should open "Cloud Login" modal when clicking on "Free Redis Cloud DB" button', async () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /Free Redis Cloud DB/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    await waitFor(() => {
      const modal = screen.getByTestId('social-oauth-dialog')
      expect(modal).toBeInTheDocument()
    })
  })

  it('should not render "Free Redis Cloud DB" button if feature flags are disabled', () => {
    renderComponent(false)

    const button = screen.queryByRole('button', {
      name: /Free Redis Cloud DB/i,
    })
    expect(button).not.toBeInTheDocument()
  })
})
