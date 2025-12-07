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
import { MOCK_OAUTH_SSO_EMAIL } from 'uiSrc/mocks/data/oauth'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/slices/interfaces'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'
import { signIn } from 'uiSrc/slices/oauth/cloud'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import OAuthSignIn from './OAuthSignIn'

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

describe('OAuthSignIn', () => {
  it('should render', () => {
    expect(render(<OAuthSignIn />)).toBeTruthy()
  })

  it('should render proper components for signIn', () => {
    render(<OAuthSignIn />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(
      screen.getByTestId('oauth-container-social-buttons'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
  })

  it('should send telemetry after click on sso btn', async () => {
    render(<OAuthSignIn />)

    fireEvent.click(screen.queryByTestId('sso-oauth') as HTMLButtonElement)

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.SSO,
        action: OAuthSocialAction.SignIn,
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
        action: OAuthSocialAction.SignIn,
      },
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, {
      action: OAuthSocialAction.SignIn,
      strategy: OAuthStrategy.SSO,
      data: {
        email: MOCK_OAUTH_SSO_EMAIL,
      },
    })
    invokeMock.mockRestore()

    const expectedActions = [setSSOFlow(OAuthSocialAction.SignIn), signIn()]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore()
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
