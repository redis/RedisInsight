import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { OAuthSsoDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'
import { VectorSetNotAvaiallableBanner } from './VectorSetNotAvailableBanner'

// We need a real store (not just initialState) because the button click dispatches Redux actions
// that need to be processed by real reducers for the modal to appear
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

const renderRqeNotAvailableCardComponent = (featureFlagsEnabled = true) => {
  const store = createTestStore(featureFlagsEnabled)
  return render(
    <>
      <VectorSetNotAvaiallableBanner />
      <OAuthSsoDialog />
    </>,
    { store },
  )
}

describe('VectorSetNotAvailableBanner', () => {
  it('should render correctly', () => {
    renderRqeNotAvailableCardComponent()

    const card = screen.getByTestId('vector-set-not-available-banner')
    expect(card).toBeInTheDocument()
  })

  it('should open "Cloud Login" modal when clicking on "Free Redis Cloud DB" button', async () => {
    renderRqeNotAvailableCardComponent()

    const button = screen.getByRole('button', { name: /Free Redis Cloud DB/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    await waitFor(() => {
      const modal = screen.getByTestId('social-oauth-dialog')
      expect(modal).toBeInTheDocument()
    })
  })

  it('should not render "Free Redis Cloud DB" button if feature flag is disabled', () => {
    renderRqeNotAvailableCardComponent(false) // Disable feature flags

    const button = screen.queryByRole('button', {
      name: /Free Redis Cloud DB/i,
    })
    expect(button).not.toBeInTheDocument()
  })
})
