import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  expectActionsToContain,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  addFreeDb,
  getPlans,
  oauthCloudUserSelector,
  setSocialDialogState,
  showOAuthProgress,
  signIn,
} from 'uiSrc/slices/oauth/cloud'
import {
  setIsRecommendedSettingsSSO,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { CloudJobStep } from 'uiSrc/electron/constants'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/slices/interfaces'
import { MOCK_OAUTH_SSO_EMAIL } from 'uiSrc/mocks/data/oauth'
import OAuthCreateDb from './OAuthCreateDb'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSsoRecommendedSettings: {
      flag: true,
    },
  }),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthCreateDb', () => {
  it('should render proper components ', () => {
    expect(render(<OAuthCreateDb />)).toBeTruthy()
  })

  it('should render proper components if user is not logged in', () => {
    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(
      screen.getByTestId('oauth-container-social-buttons'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
    expect(
      screen.getByTestId('oauth-recommended-settings-checkbox'),
    ).toBeInTheDocument()
  })

  it('should call proper actions after click on sso sign button', async () => {
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.SSO,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings: 'enabled',
      },
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('sso-email'), {
        target: { value: MOCK_OAUTH_SSO_EMAIL },
      })
    })

    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: {
        action: OAuthSocialAction.Create,
      },
    })

    const expectedActions = [setIsRecommendedSettingsSSO(true), signIn()]
    expect(store.getActions()).toEqual(expectedActions)
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper actions after click on sign button', () => {
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.Google,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings: 'enabled',
      },
    })

    const expectedActions = [setIsRecommendedSettingsSSO(true), signIn()]
    expect(store.getActions()).toEqual(expectedActions)
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render proper components if user is logged in', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-create-db')).toBeInTheDocument()
    expect(
      screen.getByTestId('oauth-recommended-settings-checkbox'),
    ).toBeInTheDocument()

    expect(
      screen.queryByTestId('oauth-agreement-checkbox'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('oauth-container-social-buttons'),
    ).not.toBeInTheDocument()
  })

  it('should call proper actions after click create', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('oauth-create-db'))

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      showOAuthProgress(true),
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
      setSocialDialogState(null),
      addFreeDb(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions after click create without recommended settings', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))
    })

    fireEvent.click(screen.getByTestId('oauth-create-db'))

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      showOAuthProgress(true),
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
      setSocialDialogState(null),
      getPlans(),
    ]
    expectActionsToContain(store.getActions(), expectedActions)
  })
})
