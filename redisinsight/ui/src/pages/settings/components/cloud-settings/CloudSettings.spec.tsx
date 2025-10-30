import React from 'react'
import {
  act,
  cleanup,
  createMockedStore,
  fireEvent,
  mockedStore,
  render,
  screen,
  userEvent,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import {
  getCapiKeys,
  getCapiKeysSuccess,
  oauthCapiKeysSelector,
  removeAllCapiKeys,
} from 'uiSrc/slices/oauth/cloud'
import { apiService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAUTH_CLOUD_CAPI_KEYS_DATA } from 'uiSrc/mocks/data/oauth'

import CloudSettings from './CloudSettings'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCapiKeysSelector: jest.fn().mockReturnValue({
    data: null,
    loading: false,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderCloudSettings = () => {
  return render(<CloudSettings />, { store })
}

describe('CloudSettings', () => {
  it('should show delete popover and call proper action on delete', async () => {
    ;(oauthCapiKeysSelector as jest.Mock).mockReturnValue({
      data: OAUTH_CLOUD_CAPI_KEYS_DATA,
      loading: false,
    })
    renderCloudSettings()

    await userEvent.click(screen.getByTestId('delete-key-btn'))
    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('delete-key-confirm-btn'))

    expect(store.getActions()).toEqual([
      getCapiKeys(),
      getCapiKeysSuccess(OAUTH_CLOUD_CAPI_KEYS_DATA),
      removeAllCapiKeys(),
    ])
  })

  it('should render', () => {
    expect(renderCloudSettings()).toBeTruthy()
  })

  it('should get api keys after render', () => {
    renderCloudSettings()

    expect(store.getActions()).toEqual([getCapiKeys()])
  })

  it('should be disabled delete all button', () => {
    ;(oauthCapiKeysSelector as jest.Mock).mockReturnValue({
      data: [],
      loading: false,
    })

    renderCloudSettings()

    expect(screen.getByTestId('delete-key-btn')).toBeDisabled()
  })

  it('should call proper telemetry events', async () => {
    apiService.delete = jest.fn().mockResolvedValueOnce({ status: 200 })
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    ;(oauthCapiKeysSelector as jest.Mock).mockReturnValue({
      data: OAUTH_CLOUD_CAPI_KEYS_DATA,
      loading: false,
    })
    renderCloudSettings()

    fireEvent.click(screen.getByTestId('delete-key-btn'))
    await waitForRiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED,
    })

    sendEventTelemetry.mockRestore()

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-key-confirm-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVED,
    })

    sendEventTelemetry.mockRestore()
  })
})
