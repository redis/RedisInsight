import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, fireEvent } from 'uiSrc/utils/test-utils'

import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import * as appFeaturesSlice from 'uiSrc/slices/app/features'
import { SideBar } from 'uiSrc/components/base/layout/sidebar'
import CreateCloud from './CreateCloud'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockFeatureFlags = (cloudAds = true) => {
  jest
    .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
    .mockReturnValue({
      cloudSso: {
        flag: true,
      },
      cloudAds: {
        flag: cloudAds,
      },
    })
}

let store: typeof mockedStore
beforeEach(() => {
  mockFeatureFlags()
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const sideBarWithCreateCloud = (
  <SideBar isExpanded={false}>
    <CreateCloud />
  </SideBar>
)

describe('CreateCloud', () => {
  it('should render', () => {
    expect(render(sideBarWithCreateCloud)).toBeTruthy()
  })

  it('should call proper actions on click cloud button', () => {
    const { container } = render(sideBarWithCreateCloud)
    const createCloudItem = container.querySelector(
      '[data-testid="create-cloud-sidebar-item"]',
    )

    fireEvent.click(createCloudItem as Element)

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.NavigationMenu),
    ])
  })

  it('should call proper telemetry when sso is disabled', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: false,
      },
      cloudAds: {
        flag: true,
      },
    })
    const { container } = render(sideBarWithCreateCloud)
    const createCloudItem = container.querySelector(
      '[data-testid="create-cloud-sidebar-item"]',
    )

    fireEvent.click(createCloudItem as Element)

    expect(sendEventTelemetry).toBeCalledWith({
      event: HELP_LINKS.cloud.event,
      eventData: {
        source: OAuthSocialSource.NavigationMenu,
      },
    })
  })

  it('should not render if cloud ads feature flag is disabled', () => {
    mockFeatureFlags(false)
    const { container } = render(sideBarWithCreateCloud)
    const createCloudItem = container.querySelector(
      '[data-testid="create-cloud-db-link"]',
    )
    expect(createCloudItem).not.toBeInTheDocument()
  })
})
