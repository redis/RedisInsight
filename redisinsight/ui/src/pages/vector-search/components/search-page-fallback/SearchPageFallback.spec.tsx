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
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { SearchPageFallback } from './SearchPageFallback'
import { SearchPageFallbackContent } from './SearchPageFallback.types'
import {
  RQE_NOT_AVAILABLE_CONTENT,
  VERSION_NOT_SUPPORTED_CONTENT,
} from './constants'

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
  describe('with RQE content', () => {
    const content = RQE_NOT_AVAILABLE_CONTENT

    it('should render with correct testId', () => {
      renderFallback(content)
      expect(screen.getByTestId('rqe-not-available')).toBeInTheDocument()
    })

    it('should render title', () => {
      renderFallback(content)
      expect(screen.getByTestId('rqe-not-available-title')).toHaveTextContent(
        'Redis Query Engine is not available for this database',
      )
    })

    it('should render feature list', () => {
      renderFallback(content)
      expect(screen.getByText('Query')).toBeInTheDocument()
      expect(screen.getByText('Secondary index')).toBeInTheDocument()
      expect(screen.getByText('Full-text search')).toBeInTheDocument()
    })

    it('should render description', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('rqe-not-available-description'),
      ).toHaveTextContent(
        'These features enable multi-field queries, aggregation',
      )
    })

    it('should render CTA text', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('rqe-not-available-cta-text'),
      ).toHaveTextContent('Use your free trial all-in-one Redis Cloud database')
    })

    it('should render illustration', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('rqe-not-available-illustration'),
      ).toBeInTheDocument()
    })

    it('should render CTA buttons when feature flags enabled', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('rqe-not-available-get-started-button'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('rqe-not-available-learn-more-link'),
      ).toBeInTheDocument()
    })

    it('should not render CTA wrapper when feature flags disabled', () => {
      renderFallback(content, false)
      expect(
        screen.queryByTestId('rqe-not-available-cta-wrapper'),
      ).not.toBeInTheDocument()
    })

    it('should open OAuth modal when clicking get started', async () => {
      renderFallback(content)
      fireEvent.click(
        screen.getByTestId('rqe-not-available-get-started-button'),
      )
      await waitFor(() => {
        expect(screen.getByTestId('social-oauth-dialog')).toBeInTheDocument()
      })
    })
  })

  describe('with version-not-supported content', () => {
    const content = VERSION_NOT_SUPPORTED_CONTENT

    it('should render with correct testId', () => {
      renderFallback(content)
      expect(screen.getByTestId('version-not-supported')).toBeInTheDocument()
    })

    it('should render title', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('version-not-supported-title'),
      ).toHaveTextContent('Redis Query Engine 2.0+ required')
    })

    it('should not render feature list', () => {
      renderFallback(content)
      expect(
        screen.queryByTestId('version-not-supported-feature-list'),
      ).not.toBeInTheDocument()
    })

    it('should render description', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('version-not-supported-description'),
      ).toHaveTextContent(
        'This page requires Redis Query Engine 2.0 or later (included with Redis 6+)',
      )
    })

    it('should render CTA text', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('version-not-supported-cta-text'),
      ).toHaveTextContent(
        'Create a free Redis Cloud database to start exploring these capabilities',
      )
    })

    it('should render CTA buttons when feature flags enabled', () => {
      renderFallback(content)
      expect(
        screen.getByTestId('version-not-supported-get-started-button'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('version-not-supported-learn-more-link'),
      ).toBeInTheDocument()
    })

    it('should not render CTA wrapper when feature flags disabled', () => {
      renderFallback(content, false)
      expect(
        screen.queryByTestId('version-not-supported-cta-wrapper'),
      ).not.toBeInTheDocument()
    })
  })

  describe('with custom content (no features)', () => {
    const customContent: SearchPageFallbackContent = {
      testId: 'custom-fallback',
      title: 'Custom Title',
      description: 'Custom description text',
      ctaText: 'Custom CTA',
      oauthSource: OAuthSocialSource.BrowserSearch,
      learnMoreLink: EXTERNAL_LINKS.redisQueryEngine,
    }

    it('should render without subtitle and features', () => {
      renderFallback(customContent)
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByTestId('custom-fallback-title')).toHaveTextContent(
        'Custom Title',
      )
      expect(
        screen.queryByTestId('custom-fallback-feature-list'),
      ).not.toBeInTheDocument()
    })
  })
})
