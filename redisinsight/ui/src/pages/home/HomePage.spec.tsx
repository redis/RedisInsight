import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import HomePage from './HomePage'

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: 'insights',
  }),
}))

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons'),
  contentSelector: jest.fn().mockReturnValue({
    data: {
      cloud_list_of_databases: {},
    },
  }),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    enhancedCloudUI: {
      flag: false,
    },
  }),
}))

/**
 * HomePage tests
 *
 * @group component
 */
describe('HomePage', () => {
  it('should render', async () => {
    expect(await render(<HomePage />)).toBeTruthy()
  })

  it('should render insights trigger', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('insights-trigger')).toBeInTheDocument()
  })

  it('should render side panel', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('side-panels-insights')).toBeInTheDocument()
  })

  it('should not render free cloud db button with enhanced cloud ui feature flag disabled', async () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      enhancedCloudUI: {
        flag: false,
      },
      cloudAds: {
        flag: true,
      },
    })
    await render(<HomePage />)

    expect(
      screen.queryByTestId('create-free-cloud-db-button'),
    ).not.toBeInTheDocument()
  })

  it('should not render free cloud db button with cloud ads feature flag disabled', async () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      enhancedCloudUI: {
        flag: true,
      },
      cloudAds: {
        flag: false,
      },
    })
    await render(<HomePage />)

    expect(
      screen.queryByTestId('create-free-cloud-db-button'),
    ).not.toBeInTheDocument()
  })

  it('should render free cloud db button with feature flags enabled', async () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      enhancedCloudUI: {
        flag: true,
      },
      cloudAds: {
        flag: true,
      },
    })
    await render(<HomePage />)

    expect(
      screen.getByTestId('create-free-cloud-db-button'),
    ).toBeInTheDocument()
  })
})
