import React from 'react'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { OAuthSsoDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import cloudReducer from 'uiSrc/slices/instances/cloud'
import instancesReducer from 'uiSrc/slices/instances/instances'
import appOauthReducer from 'uiSrc/slices/oauth/cloud'
import appFeaturesReducer from 'uiSrc/slices/app/features'
import { RqeNotAvailable } from './RqeNotAvailable'

// Create a real store for testing Redux interactions
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

const renderRqeNotAvailable = (featureFlagsEnabled = true) => {
  const store = createTestStore(featureFlagsEnabled)
  return render(
    <>
      <RqeNotAvailable />
      <OAuthSsoDialog />
    </>,
    { store },
  )
}

describe('RqeNotAvailable', () => {
  it('should render correctly', () => {
    renderRqeNotAvailable()

    const component = screen.getByTestId('rqe-not-available')
    expect(component).toBeInTheDocument()
  })

  it('should render title with correct text', () => {
    renderRqeNotAvailable()

    const title = screen.getByTestId('rqe-not-available-title')
    expect(title).toHaveTextContent(
      'Redis Query Engine is not available for this database',
    )
  })

  it('should render feature list with correct items', () => {
    renderRqeNotAvailable()

    expect(screen.getByText('Query')).toBeInTheDocument()
    expect(screen.getByText('Secondary index')).toBeInTheDocument()
    expect(screen.getByText('Full-text search')).toBeInTheDocument()
  })

  it('should render description text', () => {
    renderRqeNotAvailable()

    const description = screen.getByTestId('rqe-description')
    expect(description).toHaveTextContent(
      'These features enable multi-field queries, aggregation, exact phrase matching, numeric filtering, geo filtering and vector similarity semantic search on top of text queries.',
    )
  })

  it('should render CTA text', () => {
    renderRqeNotAvailable()

    const ctaText = screen.getByTestId('rqe-cta-text')
    expect(ctaText).toHaveTextContent(
      'Use your free trial all-in-one Redis Cloud database to start exploring these capabilities',
    )
  })

  it('should render illustration', () => {
    renderRqeNotAvailable()

    const illustration = screen.getByTestId('rqe-illustration')
    expect(illustration).toBeInTheDocument()
  })

  it('should render "Get started for free" button when feature flags are enabled', () => {
    renderRqeNotAvailable()

    const button = screen.getByTestId('rqe-get-started-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(/Get started for free/i)
  })

  it('should render "Learn more" link', () => {
    renderRqeNotAvailable()

    const link = screen.getByTestId('rqe-learn-more-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent('Learn more')
  })

  it('should open OAuth modal when clicking "Get started for free" button', async () => {
    renderRqeNotAvailable()

    const button = screen.getByTestId('rqe-get-started-button')
    fireEvent.click(button)

    await waitFor(() => {
      const modal = screen.getByTestId('social-oauth-dialog')
      expect(modal).toBeInTheDocument()
    })
  })

  it('should not render CTA wrapper when feature flags are disabled', () => {
    renderRqeNotAvailable(false)

    const ctaWrapper = screen.queryByTestId('rqe-cta-wrapper')
    expect(ctaWrapper).not.toBeInTheDocument()
  })

  it('should have correct link href for "Learn more"', () => {
    renderRqeNotAvailable()

    const link = screen.getByTestId('rqe-learn-more-link')
    expect(link).toHaveAttribute('href')
    expect(link.getAttribute('href')).toContain('redis.io')
  })
})
