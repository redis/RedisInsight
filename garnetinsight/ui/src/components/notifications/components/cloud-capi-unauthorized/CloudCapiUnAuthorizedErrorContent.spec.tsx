import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  act,
} from 'uiSrc/utils/test-utils'

import { removeCapiKey } from 'uiSrc/slices/oauth/cloud'
import { apiService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'

import CloudCapiUnAuthorizedErrorContent, {
  Props,
} from './CloudCapiUnAuthorizedErrorContent'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedProps = mock<Props>()
describe('CloudCapiUnAuthorizedErrorContent', () => {
  it('should render', () => {
    expect(
      render(<CloudCapiUnAuthorizedErrorContent {...mockedProps} />),
    ).toBeTruthy()
  })

  it('should сall proper action on delete', () => {
    const onClose = jest.fn()
    render(
      <CloudCapiUnAuthorizedErrorContent {...mockedProps} onClose={onClose} />,
    )

    fireEvent.click(screen.getByTestId('remove-api-key-btn'))

    expect(store.getActions()).toEqual([removeCapiKey()])
    expect(onClose).toBeCalled()
  })

  it('should сall proper history push on go to settings', () => {
    const pushMock = jest.fn()
    const onClose = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    render(
      <CloudCapiUnAuthorizedErrorContent {...mockedProps} onClose={onClose} />,
    )

    fireEvent.click(screen.getByTestId('go-to-settings-btn'))

    expect(pushMock).toBeCalledWith('/settings#cloud')
    expect(onClose).toBeCalled()
  })

  it('should сall proper telemetry on delete', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    apiService.delete = jest.fn().mockResolvedValueOnce({ status: 200 })

    render(
      <CloudCapiUnAuthorizedErrorContent {...mockedProps} resourceId="123" />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('remove-api-key-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
      eventData: {
        source: OAuthSocialSource.ConfirmationMessage,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
