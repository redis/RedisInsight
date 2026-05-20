import React from 'react'
import { Environment } from 'apiClient'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  waitForRiPopoverVisible,
  waitForRiTooltipVisible,
  mockedStore,
  cleanup,
  waitForStack,
  act,
} from 'uiSrc/utils/test-utils'

import {
  bulkImportDefaultData,
  bulkImportDefaultDataSuccess,
} from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { apiService } from 'uiSrc/services'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import LoadSampleData from './LoadSampleData'

const PRODUCTION_DISABLED_TOOLTIP =
  'Button disabled for your production database to avoid accidental data modifications.'

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

jest.mock('uiSrc/components/hooks/useDatabaseEnvironment', () => ({
  ...jest.requireActual('uiSrc/components/hooks/useDatabaseEnvironment'),
  useDatabaseEnvironment: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
    environment: Environment.Unspecified,
    isDangerousCommand: () => false,
  })
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

  describe('production mode', () => {
    it('should disable the button and not open the popover in production', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })

      render(<LoadSampleData />)

      const btn = screen.getByTestId('load-sample-data-btn')
      expect(btn).toBeDisabled()

      fireEvent.click(btn)
      expect(
        screen.queryByTestId('load-sample-data-btn-confirm'),
      ).not.toBeInTheDocument()
    })

    it('should show the production tooltip copy on focus in production', async () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })

      render(<LoadSampleData />)

      await act(async () => {
        fireEvent.focus(
          screen.getByTestId('load-sample-data-btn').parentElement!,
        )
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getAllByText(PRODUCTION_DISABLED_TOOLTIP)[0],
      ).toBeInTheDocument()
    })
  })
})
