import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'

import {
  defaultSelectedKeyAction,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { apiService } from 'uiSrc/services'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import KeyDetails, { Props as KeyDetailsProps } from './KeyDetails'
import { KeyValueFormat } from 'uiSrc/constants'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedProps = mock<KeyDetailsProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('KeyDetails', () => {
  it('should render', () => {
    expect(render(<KeyDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call proper actions after render', () => {
    render(<KeyDetails {...instance(mockedProps)} />)

    expect(store.getActions()).toEqual([
      defaultSelectedKeyAction(),
      setSelectedKeyRefreshDisabled(false),
    ])
  })

  it('should call proper actions after render when key name is truncated', () => {
    render(
      <KeyDetails
        {...instance(mockedProps)}
        keyProp={MOCK_TRUNCATED_BUFFER_VALUE}
      />,
    )

    expect(store.getActions()).toEqual([defaultSelectedKeyAction()])
  })

  it('should render nothing when there are no keys', () => {
    render(
      <KeyDetails
        {...instance(mockedProps)}
        totalKeys={0}
        keysLastRefreshTime={null}
      />,
    )

    expect(screen.queryByTestId('explore-guides')).not.toBeInTheDocument()
    expect(screen.queryByTestId('select-key-message')).not.toBeInTheDocument()
  })

  it('should render explore-guides when there are no keys', () => {
    render(
      <KeyDetails
        {...instance(mockedProps)}
        totalKeys={0}
        keysLastRefreshTime={1}
      />,
    )

    expect(screen.getByTestId('explore-guides')).toBeInTheDocument()
  })

  it('should render proper message when there are keys', () => {
    render(
      <KeyDetails
        {...instance(mockedProps)}
        totalKeys={10}
        keysLastRefreshTime={1}
      />,
    )

    expect(screen.getByTestId('select-key-message')).toBeInTheDocument()
  })

  it('should call proper telemetry after open key details', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    apiService.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { length: 1, type: 'hash' } })

    await act(async () => {
      render(
        <KeyDetails
          {...instance(mockedProps)}
          keyProp={stringToBuffer('key')}
        />,
      )
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_KEY_VALUE_VIEWED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        length: 1,
        keyType: 'hash',
        formatter: KeyValueFormat.Unicode,
      },
    })
  })
})
