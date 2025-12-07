import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchDBAnalysisReportsHistory } from 'uiSrc/slices/analytics/dbAnalysis'
import {
  render,
  screen,
  waitForRedisUiSelectVisible,
  userEvent,
} from 'uiSrc/utils/test-utils'

import DatabaseAnalysisPage from './DatabaseAnalysisPage'

jest.mock('uiSrc/slices/analytics/dbAnalysis', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/dbAnalysis'),
  fetchDBAnalysisReportsHistory: jest.fn(),
  dbAnalysisReportsSelector: jest.fn().mockReturnValue({
    data: [{ id: '123', createdAt: Date.now(), db: 0 }],
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

/**
 * DatabaseAnalysisPage tests
 *
 * @group component
 */
describe('DatabaseAnalysisPage', () => {
  it('should call fetchDBAnalysisReportsHistory after rendering', async () => {
    const fetchDBAnalysisReportsHistoryMock = jest.fn()
    ;(fetchDBAnalysisReportsHistory as jest.Mock).mockImplementation(
      () => fetchDBAnalysisReportsHistoryMock,
    )

    expect(render(<DatabaseAnalysisPage />)).toBeTruthy()
    expect(fetchDBAnalysisReportsHistoryMock).toBeCalled()
  })

  it('should send telemetry event after click "new analysis" btn', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<DatabaseAnalysisPage />)

    await userEvent.click(screen.getByTestId('select-report'))

    await waitForRedisUiSelectVisible()

    await userEvent.click(
      document.querySelector('[data-test-subj="items-report-123"]') as Element,
    )

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.DATABASE_ANALYSIS_HISTORY_VIEWED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'REDIS_CLOUD',
      },
    })

    sendEventTelemetry.mockRestore()
  })
})
