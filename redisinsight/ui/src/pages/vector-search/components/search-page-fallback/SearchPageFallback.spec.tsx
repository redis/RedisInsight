import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { OAuthSsoDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import instancesReducer from 'uiSrc/slices/instances/instances'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { SearchPageFallback } from './SearchPageFallback'
import { SearchPageFallbackContent } from './SearchPageFallback.types'

const createTestStore = (featureFlagsEnabled = true) =>
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
              [FeatureFlags.cloudSso]: { flag: featureFlagsEnabled },
              [FeatureFlags.cloudAds]: { flag: featureFlagsEnabled },
              [FeatureFlags.envDependent]: { flag: featureFlagsEnabled },
            },
          },
        },
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })

const CONTENT_WITH_FEATURES: SearchPageFallbackContent = {
  testId: 'test-fallback',
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  features: ['Feature A', 'Feature B'],
  description: 'Test description',
  ctaText: 'Test CTA',
  oauthSource: OAuthSocialSource.BrowserSearch,
}

const CONTENT_WITHOUT_FEATURES: SearchPageFallbackContent = {
  testId: 'minimal-fallback',
  title: 'Minimal Title',
  description: 'Minimal description',
  ctaText: 'Minimal CTA',
  oauthSource: OAuthSocialSource.BrowserSearch,
}

const renderFallback = (
  content: SearchPageFallbackContent,
  featureFlagsEnabled = true,
) => {
  const store = createTestStore(featureFlagsEnabled)
  return render(
    <>
      <SearchPageFallback content={content} />
      <OAuthSsoDialog />
    </>,
    { store },
  )
}

describe('SearchPageFallback', () => {
  it('should render all content sections', () => {
    renderFallback(CONTENT_WITH_FEATURES)

    expect(screen.getByTestId('test-fallback')).toBeInTheDocument()
    expect(screen.getByTestId('test-fallback-title')).toHaveTextContent(
      'Test Title',
    )
    expect(screen.getByTestId('test-fallback-description')).toBeInTheDocument()
    expect(screen.getByTestId('test-fallback-cta-text')).toBeInTheDocument()
    expect(screen.getByTestId('test-fallback-illustration')).toBeInTheDocument()
  })

  it('should render feature list when features are provided', () => {
    renderFallback(CONTENT_WITH_FEATURES)

    expect(screen.getByText('Feature A')).toBeInTheDocument()
    expect(screen.getByText('Feature B')).toBeInTheDocument()
  })

  it('should not render subtitle or feature list when not provided', () => {
    renderFallback(CONTENT_WITHOUT_FEATURES)

    expect(screen.getByTestId('minimal-fallback')).toBeInTheDocument()
    expect(
      screen.queryByTestId('minimal-fallback-feature-list'),
    ).not.toBeInTheDocument()
  })

  it('should render CTA buttons when feature flags are enabled', () => {
    renderFallback(CONTENT_WITH_FEATURES)

    expect(
      screen.getByTestId('test-fallback-get-started-button'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('test-fallback-learn-more-link'),
    ).toBeInTheDocument()
  })

  it('should not render CTA wrapper when feature flags are disabled', () => {
    renderFallback(CONTENT_WITH_FEATURES, false)

    expect(
      screen.queryByTestId('test-fallback-cta-wrapper'),
    ).not.toBeInTheDocument()
  })

  it('should open OAuth modal when clicking get started button', async () => {
    renderFallback(CONTENT_WITH_FEATURES)

    fireEvent.click(screen.getByTestId('test-fallback-get-started-button'))

    await waitFor(() => {
      expect(screen.getByTestId('social-oauth-dialog')).toBeInTheDocument()
    })
  })
})
