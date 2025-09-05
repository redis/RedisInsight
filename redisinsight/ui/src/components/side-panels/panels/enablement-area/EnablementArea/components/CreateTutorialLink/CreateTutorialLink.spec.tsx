import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import CreateTutorailLink from './CreateTutorialLink'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('CreateTutorialLink', () => {
  it('should render', () => {
    expect(render(<CreateTutorailLink />)).toBeTruthy()
  })

  it('should call proper telemetry event after click read more', () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<CreateTutorailLink />)

    fireEvent.click(screen.getByTestId('read-more-link'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_CREATE_TUTORIAL_LINK_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
