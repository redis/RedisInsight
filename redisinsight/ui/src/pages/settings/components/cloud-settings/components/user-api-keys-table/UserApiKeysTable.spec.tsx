import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
  waitForRiPopoverVisible,
  act,
} from 'uiSrc/utils/test-utils'

import { removeCapiKey } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import UserApiKeysTable, { Props } from './UserApiKeysTable'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedCapiKeys = [
  {
    id: '1',
    name: 'RedisInsight-f4868252-a128-4a02-af75-bd3c99898267-2020-11-01T-123',
    createdAt: '2023-08-02T09:07:41.680Z',
    lastUsed: '2023-08-02T09:07:41.680Z',
    valid: true,
  },
  {
    id: '2',
    name: 'RedisInsight-dawdaw68252-a128-4a02-af75-bd3c99898267-2020-11-01T-123',
    createdAt: '2023-08-02T09:07:41.680Z',
    lastUsed: '2023-08-02T09:07:41.680Z',
    valid: false,
  },
  {
    id: '3',
    name: 'RedisInsight-d4543wdaw68252-a128-4a02-af75-bd3c99898267-2020-11-01T-123',
    createdAt: '2023-08-02T09:07:41.680Z',
    lastUsed: '2023-08-02T09:07:41.680Z',
    valid: false,
  },
]

describe('UserApiKeysTable', () => {
  it('should render', () => {
    expect(render(<UserApiKeysTable {...mockedProps} />)).toBeTruthy()
  })

  it('should render message when there are no keys', () => {
    render(<UserApiKeysTable {...mockedProps} items={[]} />)

    expect(screen.getByTestId('no-api-keys-message')).toBeInTheDocument()
  })

  it('should render row content properly', () => {
    render(<UserApiKeysTable {...mockedProps} items={mockedCapiKeys} />)

    expect(screen.getByText(mockedCapiKeys[0].name)).toBeVisible()
  })

  it('should show delete popover and call proper action on delete', async () => {
    render(<UserApiKeysTable {...mockedProps} items={mockedCapiKeys} />)

    fireEvent.click(
      screen.getByTestId(`remove-key-button-${mockedCapiKeys[0].name}-icon`),
    )
    await waitForRiPopoverVisible()

    fireEvent.click(
      screen.getByTestId(`remove-key-button-${mockedCapiKeys[0].name}`),
    )

    expect(store.getActions()).toEqual([removeCapiKey()])
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    apiService.delete = jest.fn().mockResolvedValue({ status: 200 })

    render(<UserApiKeysTable {...mockedProps} items={mockedCapiKeys} />)

    sendEventTelemetry.mockRestore()

    fireEvent.click(
      screen.getByTestId(`remove-key-button-${mockedCapiKeys[0].name}-icon`),
    )
    await waitForRiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED,
      eventData: {
        source: OAuthSocialSource.SettingsPage,
      },
    })

    sendEventTelemetry.mockRestore()

    await act(() => {
      fireEvent.click(
        screen.getByTestId(`remove-key-button-${mockedCapiKeys[0].name}`),
      )
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
      eventData: {
        source: OAuthSocialSource.SettingsPage,
      },
    })

    sendEventTelemetry.mockRestore()

    fireEvent.click(
      screen.getByTestId(`copy-api-key-${mockedCapiKeys[0].name}-btn`),
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_NAME_COPIED,
    })
  })
})
