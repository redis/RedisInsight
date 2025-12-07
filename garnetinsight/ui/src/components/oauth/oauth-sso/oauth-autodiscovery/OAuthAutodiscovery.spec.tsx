import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  OAuthStrategy,
} from 'uiSrc/slices/interfaces'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'
import {
  oauthCloudUserSelector,
  setOAuthCloudSource,
  signIn,
} from 'uiSrc/slices/oauth/cloud'
import {
  loadSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import {
  MOCK_OAUTH_SSO_EMAIL,
  MOCK_OAUTH_USER_PROFILE,
} from 'uiSrc/mocks/data/oauth'
import OAuthAutodiscovery from './OAuthAutodiscovery'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null,
  }),
}))

const invokeMock = jest.fn()
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock },
  } as any
})

describe('OAuthAutodiscovery', () => {
  it('should render', () => {
    expect(render(<OAuthAutodiscovery />)).toBeTruthy()
  })

  it('should render social buttons when not logged in', () => {
    render(<OAuthAutodiscovery />)

    expect(screen.queryByTestId('github-oauth')).toBeInTheDocument()
    expect(screen.queryByTestId('google-oauth')).toBeInTheDocument()
  })

  it('should send telemetry after click on github btn', async () => {
    render(<OAuthAutodiscovery />)

    fireEvent.click(screen.queryByTestId('github-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.GitHub,
        action: OAuthSocialAction.Import,
        source: OAuthSocialSource.Autodiscovery,
      },
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, {
      action: OAuthSocialAction.Import,
      strategy: OAuthStrategy.GitHub,
    })
    invokeMock.mockRestore()

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Import),
      setOAuthCloudSource(OAuthSocialSource.Autodiscovery),
      signIn(),
    ]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore()
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should send telemetry after click on sso btn', async () => {
    render(<OAuthAutodiscovery />)

    fireEvent.click(screen.queryByTestId('sso-oauth') as HTMLButtonElement)

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.SSO,
        action: OAuthSocialAction.Import,
        source: OAuthSocialSource.Autodiscovery,
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

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: {
        action: OAuthSocialAction.Import,
      },
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, {
      action: OAuthSocialAction.Import,
      strategy: OAuthStrategy.SSO,
      data: {
        email: MOCK_OAUTH_SSO_EMAIL,
      },
    })
    invokeMock.mockRestore()

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Import),
      setOAuthCloudSource(OAuthSocialSource.Autodiscovery),
      signIn(),
    ]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore()
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render discover button and call proper actions on click when logged in', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })

    render(<OAuthAutodiscovery />)

    fireEvent.click(screen.getByTestId('oauth-discover-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: 'autodiscovery',
      },
    })

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Import),
      loadSubscriptionsRedisCloud(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
