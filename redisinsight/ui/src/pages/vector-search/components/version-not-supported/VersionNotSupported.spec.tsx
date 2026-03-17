import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { OAuthSsoDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import instancesReducer from 'uiSrc/slices/instances/instances'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'
import { VersionNotSupported } from './VersionNotSupported'

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

const renderVersionNotSupported = (featureFlagsEnabled = true) => {
  const store = createTestStore(featureFlagsEnabled)
  return render(
    <>
      <VersionNotSupported />
      <OAuthSsoDialog />
    </>,
    { store },
  )
}

describe('VersionNotSupported', () => {
  it('should render correctly', () => {
    renderVersionNotSupported()

    const component = screen.getByTestId('version-not-supported')
    expect(component).toBeInTheDocument()
  })

  it('should render title with correct text', () => {
    renderVersionNotSupported()

    const title = screen.getByTestId('version-not-supported-title')
    expect(title).toHaveTextContent(
      'Redis Query Engine 2.0+ required',
    )
  })

  it('should render description text', () => {
    renderVersionNotSupported()

    const description = screen.getByTestId('version-not-supported-description')
    expect(description).toHaveTextContent(
      'This page requires Redis Query Engine 2.0 or later (included with Redis 6+)',
    )
  })

  it('should render CTA text', () => {
    renderVersionNotSupported()

    const ctaText = screen.getByTestId('version-not-supported-cta-text')
    expect(ctaText).toHaveTextContent(
      'Create a free Redis Cloud database to start exploring these capabilities.',
    )
  })

  it('should render illustration', () => {
    renderVersionNotSupported()

    const illustration = screen.getByTestId(
      'version-not-supported-illustration',
    )
    expect(illustration).toBeInTheDocument()
  })

  it('should render "Get started for free" button when feature flags are enabled', () => {
    renderVersionNotSupported()

    const button = screen.getByTestId(
      'version-not-supported-get-started-button',
    )
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(/Get started for free/i)
  })

  it('should render "Learn more" link', () => {
    renderVersionNotSupported()

    const link = screen.getByTestId('version-not-supported-learn-more-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent('Learn more')
  })

  it('should open OAuth modal when clicking "Get started for free" button', async () => {
    renderVersionNotSupported()

    const button = screen.getByTestId(
      'version-not-supported-get-started-button',
    )
    fireEvent.click(button)

    await waitFor(() => {
      const modal = screen.getByTestId('social-oauth-dialog')
      expect(modal).toBeInTheDocument()
    })
  })

  it('should not render CTA wrapper when feature flags are disabled', () => {
    renderVersionNotSupported(false)

    const ctaWrapper = screen.queryByTestId('version-not-supported-cta-wrapper')
    expect(ctaWrapper).not.toBeInTheDocument()
  })

  it('should have correct link href for "Learn more"', () => {
    renderVersionNotSupported()

    const link = screen.getByTestId('version-not-supported-learn-more-link')
    expect(link).toHaveAttribute('href')
    expect(link.getAttribute('href')).toContain('redis.io')
  })
})
