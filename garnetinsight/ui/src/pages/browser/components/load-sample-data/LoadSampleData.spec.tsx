import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  waitForRiPopoverVisible,
  mockedStore,
  cleanup,
  waitForStack,
} from 'uiSrc/utils/test-utils'

import {
  bulkImportDefaultData,
  bulkImportDefaultDataSuccess,
} from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { apiService } from 'uiSrc/services'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import LoadSampleData from './LoadSampleData'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
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

describe('LoadSampleData', () => {
  it('should render', () => {
    expect(render(<LoadSampleData />)).toBeTruthy()
  })

  it('should call proper actions', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    apiService.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { data: {} } })

    render(<LoadSampleData />)

    fireEvent.click(screen.getByTestId('load-sample-data-btn'))
    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('load-sample-data-btn-confirm'))

    await waitForStack()

    const expectedActions = [
      bulkImportDefaultData(),
      bulkImportDefaultDataSuccess(),
      addMessageNotification(successMessages.UPLOAD_DATA_BULK()),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.IMPORT_SAMPLES_CLICKED,
      eventData: { databaseId: '1' },
    })
  })
})
