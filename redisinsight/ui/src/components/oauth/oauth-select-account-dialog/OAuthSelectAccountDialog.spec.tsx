import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  getUserInfo,
  getUserInfoSuccess,
  oauthCloudSelector,
  oauthCloudUserDataSelector,
  setSelectAccountDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { apiService } from 'uiSrc/services'
import { loadSubscriptionsRedisCloud } from 'uiSrc/slices/instances/cloud'
import OAuthSelectAccountDialog from './OAuthSelectAccountDialog'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
    isOpenSelectAccountDialog: true,
  }),
  oauthCloudUserDataSelector: jest.fn().mockReturnValue({
    id: 1,
    accounts: [
      { id: 1, name: 'name1' },
      { id: 2, name: 'name2' },
    ],
  }),
}))
jest.mock('uiSrc/slices/instances/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/instances/cloud'),
  cloudSelector: jest.fn().mockReturnValue({
    ssoFlow: 'import',
  }),
}))

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthSelectAccountDialog', () => {
  it('should render', () => {
    const { queryByTestId } = render(<OAuthSelectAccountDialog />)
    expect(queryByTestId('oauth-select-account-dialog')).toBeInTheDocument()
  })
  it('should not render if account.length < 2', () => {
    ;(oauthCloudUserDataSelector as jest.Mock).mockReturnValueOnce({
      accounts: [{ id: 1, name: 'name1' }],
    })
    const { queryByTestId } = render(<OAuthSelectAccountDialog />)
    expect(queryByTestId('oauth-select-account-dialog')).not.toBeInTheDocument()
  })
  it('should not render if isOpenSelectAccountDialog=false', () => {
    ;(oauthCloudSelector as jest.Mock).mockReturnValueOnce({
      isOpenSelectAccountDialog: false,
    })
    const { queryByTestId } = render(<OAuthSelectAccountDialog />)
    expect(queryByTestId('oauth-select-account-dialog')).not.toBeInTheDocument()
  })

  it('should send telemetry after close modal', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { queryByTestId } = render(<OAuthSelectAccountDialog />)

    const closeEl = queryByTestId('oauth-select-account-dialog')?.querySelector(
      '.euiModal__closeIcon',
    )

    fireEvent.click(closeEl as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FORM_CLOSED,
      eventData: {
        accountsCount: 2,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('click on submit btn should call getUserInfo', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    apiService.put = jest.fn().mockResolvedValue({ status: 200 })

    const { queryByTestId } = render(<OAuthSelectAccountDialog />)
    const submitEl = queryByTestId('submit-oauth-select-account-dialog')

    await act(() => {
      fireEvent.click(submitEl as HTMLButtonElement)
    })

    const expectedActions = [
      getUserInfo(),
      getUserInfoSuccess(),
      loadSubscriptionsRedisCloud(),
      setSelectAccountDialogState(false),
    ]
    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_SELECTED,
      eventData: {
        accountsCount: 2,
        action: 'import',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
  it('on error in activeAccount telemetry should be sent', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { queryByTestId } = render(<OAuthSelectAccountDialog />)

    const submitEl = queryByTestId('submit-oauth-select-account-dialog')

    const errorMessage = 'error'
    const responsePayload = {
      response: {
        status: 500,
        data: { message: errorMessage },
      },
    }

    apiService.put = jest.fn().mockRejectedValueOnce(responsePayload)

    await act(() => {
      fireEvent.click(submitEl as HTMLButtonElement)
    })

    expect(sendEventTelemetry).toBeCalledTimes(1)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FAILED,
      eventData: {
        error: errorMessage,
        accountsCount: 2,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
