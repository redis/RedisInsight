import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { fireEvent } from '@testing-library/react'
import {
  act,
  cleanup,
  mockedStore,
  render,
  screen,
  waitForRiPopoverVisible,
  mockedStoreFn,
} from 'uiSrc/utils/test-utils'

import {
  getUserInfo,
  logoutUser,
  oauthCloudUserSelector,
  setInitialLoadingState,
} from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  loadSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { MOCK_OAUTH_USER_PROFILE } from 'uiSrc/mocks/data/oauth'

import { appInfoSelector } from 'uiSrc/slices/app/info'
import OAuthUserProfile, { Props } from './OAuthUserProfile'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    loading: false,
    data: null,
    error: '',
    initialLoading: false,
  }),
}))

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {},
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore

describe('OAuthUserProfile', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStoreFn())
    store.clearActions()
  })

  it('should render', () => {
    expect(render(<OAuthUserProfile {...mockedProps} />)).toBeTruthy()
  })

  it('should render loading spinner initially', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      data: null,
      error: '',
      initialLoading: true,
    })
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.getByTestId('oath-user-profile-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-sign-in-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('user-profile-btn')).not.toBeInTheDocument()
  })

  it('should render sign in button if no profile', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      loading: false,
      data: null,
      error: 'Some error',
    })
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.getByTestId('cloud-sign-in-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('user-profile-btn')).not.toBeInTheDocument()
  })

  it('should not render sign in button if no profile and mas build', () => {
    ;(appInfoSelector as jest.Mock).mockReturnValueOnce({
      server: {
        packageType: 'mas',
      },
    })
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.queryByTestId('cloud-sign-in-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('user-profile-btn')).not.toBeInTheDocument()
  })

  it('should render profile button', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: {},
    })
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.getByTestId('user-profile-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-sign-in-btn')).not.toBeInTheDocument()
  })

  it('should render profile info', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForRiPopoverVisible()

    expect(screen.getByTestId('account-full-name')).toHaveTextContent(
      'Bill Russell',
    )
    expect(screen.getByTestId('profile-account-1-selected')).toHaveTextContent(
      'Bill R #1',
    )
    expect(screen.getByTestId('profile-account-2')).toHaveTextContent(
      'Bill R 2 #2',
    )
  })

  it('should call proper action and telemetry after click on import databases', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForRiPopoverVisible()
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('profile-import-cloud-databases'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: OAuthSocialSource.UserProfile,
      },
    })

    expect(store.getActions()).toEqual([
      setInitialLoadingState(false),
      setSSOFlow(OAuthSocialAction.Import),
      loadSubscriptionsRedisCloud(),
    ])
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action and telemetry after click on account', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForRiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_PROFILE_OPENED,
    })

    fireEvent.click(screen.getByTestId('profile-account-2'))

    expect(store.getActions()).toEqual([
      setInitialLoadingState(false),
      getUserInfo(),
    ])
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action and telemetry after click on cloud link', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForRiPopoverVisible()
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('cloud-console-link'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.CLOUD_CONSOLE_CLICKED,
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action after click on logout', async () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE,
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })

    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('profile-logout'))

    expect(store.getActions()).toEqual([
      setInitialLoadingState(false),
      logoutUser(),
      setSSOFlow(),
    ])
  })
})
