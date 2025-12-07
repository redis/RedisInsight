import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { appInfoSelector } from 'uiSrc/slices/app/info'
import { BuildType } from 'uiSrc/constants/env'
import { FeatureFlags } from 'uiSrc/constants'
import HomePageTemplate from './HomePageTemplate'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {},
  }),
}))

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

const ChildComponent = () => <div data-testid="child" />

describe('HomePageTemplate', () => {
  it('should render', () => {
    expect(
      render(
        <HomePageTemplate>
          <ChildComponent />
        </HomePageTemplate>,
      ),
    ).toBeTruthy()
  })

  it('should render tabs by default', () => {
    ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
      ...mockAppInfoSelector,
      server: {
        buildType: BuildType.DockerOnPremise,
      },
    }))

    render(
      <HomePageTemplate>
        <ChildComponent />
      </HomePageTemplate>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('home-tabs')).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: true },
    )

    render(
      <HomePageTemplate>
        <ChildComponent />
      </HomePageTemplate>,
      {
        store: mockStore(initialStoreState),
      },
    )
    expect(screen.queryByTestId('home-page-sso-profile')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: false },
    )

    render(
      <HomePageTemplate>
        <ChildComponent />
      </HomePageTemplate>,
      {
        store: mockStore(initialStoreState),
      },
    )
    expect(
      screen.queryByTestId('home-page-sso-profile'),
    ).not.toBeInTheDocument()
  })
})
