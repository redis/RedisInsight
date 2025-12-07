import React from 'react'
import { cloneDeep } from 'lodash'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  render,
  cleanup,
  mockedStore,
  fireEvent,
  screen,
  act,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'
import { MOCK_OAUTH_SSO_EMAIL } from 'uiSrc/mocks/data/oauth'
import OAuthForm from './OAuthForm'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

const onClick = jest.fn()

let store: typeof mockedStore
const invokeMock = jest.fn()
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock },
  } as any
})

describe('OAuthForm', () => {
  afterEach(() => {
    onClick.mockRestore()
  })

  it('should render', () => {
    expect(
      render(<OAuthForm>{(children) => <>{children}</>}</OAuthForm>),
    ).toBeTruthy()
  })

  it('should call proper actions after click on google', () => {
    render(
      <OAuthForm onClick={onClick}>{(children) => <>{children}</>}</OAuthForm>,
    )

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.Google)
  })

  it('should call proper actions after click on sso', async () => {
    render(
      <OAuthForm onClick={onClick}>{(children) => <>{children}</>}</OAuthForm>,
    )

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

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
      eventData: {},
    })

    expect(onClick).toBeCalledWith(OAuthStrategy.SSO)
  })

  it('should go back to main oauth form by clicking to back button', async () => {
    render(
      <OAuthForm onClick={onClick}>{(children) => <>{children}</>}</OAuthForm>,
    )

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()
    expect(screen.getByTestId('btn-back')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('btn-back'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_CANCELED,
      eventData: {},
    })

    expect(screen.getByTestId('sso-oauth')).toBeInTheDocument()
  })

  it('should disable submit button id incorrect email provided', async () => {
    render(
      <OAuthForm onClick={onClick}>{(children) => <>{children}</>}</OAuthForm>,
    )

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sso-email'), {
        target: { value: 'bad-email' },
      })
    })

    expect(screen.getByTestId('btn-submit')).toBeDisabled()

    await act(async () => {
      fireEvent.focus(screen.getByTestId('btn-submit'))
    })

    await waitFor(() => screen.getByTestId('btn-submit-tooltip'))

    expect(screen.getByTestId('btn-submit-tooltip')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })
  })
})
