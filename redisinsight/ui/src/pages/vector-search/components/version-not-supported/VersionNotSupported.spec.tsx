import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { render, screen } from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import instancesReducer from 'uiSrc/slices/instances/instances'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'
import { VersionNotSupported } from './VersionNotSupported'

const createTestStore = () =>
  configureStore({
    reducer: combineReducers({
      connections: combineReducers({
        cloud: cloudReducer,
        instances: instancesReducer,
      }),
      oauth: combineReducers({ cloud: appOauthReducer }),
      app: combineReducers({ features: appFeaturesReducer }),
    }),
    preloadedState: {
      app: {
        features: {
          featureFlags: {
            features: {
              [FeatureFlags.cloudSso]: { flag: true },
              [FeatureFlags.cloudAds]: { flag: true },
              [FeatureFlags.envDependent]: { flag: true },
            },
          },
        },
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })

describe('VersionNotSupported', () => {
  it('should render with version not supported content', () => {
    render(<VersionNotSupported />, { store: createTestStore() })

    expect(screen.getByTestId('version-not-supported')).toBeInTheDocument()
    expect(
      screen.getByTestId('version-not-supported-title'),
    ).toBeInTheDocument()
  })
})
