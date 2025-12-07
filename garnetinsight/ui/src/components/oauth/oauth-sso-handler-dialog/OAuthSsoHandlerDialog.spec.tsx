import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Maybe } from 'uiSrc/utils'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'

import OAuthSsoHandlerDialog from './OAuthSsoHandlerDialog'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudUserDataSelector: jest.fn().mockReturnValue(null),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const childrenMock = (
  onClick: (
    e: React.MouseEvent,
    {
      source,
      action,
    }: { source: OAuthSocialSource; action?: Maybe<OAuthSocialAction> },
  ) => void,
  {
    source,
    action,
  }: { source: OAuthSocialSource; action?: Maybe<OAuthSocialAction> },
) => (
  <div
    onClick={(e) => onClick(e, { source, action })}
    onKeyDown={() => {}}
    data-testid="link"
    aria-label="link"
    role="link"
    tabIndex={0}
  >
    link
  </div>
)

afterEach(() => {
  ;(sendEventTelemetry as jest.Mock).mockRestore()
})

describe('OAuthSsoHandlerDialog', () => {
  it('should render', () => {
    expect(
      render(
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) =>
            childrenMock(ssoCloudHandlerClick, {
              source: OAuthSocialSource.BrowserContentMenu,
            })
          }
        </OAuthSsoHandlerDialog>,
      ),
    ).toBeTruthy()
  })

  it(`setSocialDialogState should not called if ${FeatureFlags.cloudSso} is not enabled`, () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) =>
          childrenMock(ssoCloudHandlerClick, {
            source: OAuthSocialSource.BrowserContentMenu,
          })
        }
      </OAuthSsoHandlerDialog>,
    )

    expect(sendEventTelemetry).not.toBeCalled()
    expect(store.getActions()).toEqual([])
  })

  it(`setSocialDialogState should called if ${FeatureFlags.cloudSso} is enabled`, () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockImplementation(() => ({
      [FeatureFlags.cloudSso]: { flag: true },
    }))

    render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) =>
          childrenMock(ssoCloudHandlerClick, {
            source: OAuthSocialSource.BrowserContentMenu,
            action: OAuthSocialAction.Create,
          })
        }
      </OAuthSsoHandlerDialog>,
    )

    fireEvent.click(screen.queryByTestId('link')!)

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.BrowserContentMenu),
    ]
    expect(store.getActions()).toEqual(expectedActions)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.BrowserContentMenu,
      },
    })
  })
})
