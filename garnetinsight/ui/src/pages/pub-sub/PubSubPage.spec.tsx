import React from 'react'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { render } from 'uiSrc/utils/test-utils'

import PubSubPage from './PubSubPage'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'db_name',
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
  sendPageViewTelemetry: jest.fn(),
}))

/**
 * PubSubPage tests
 *
 * @group component
 */
describe('PubSubPage', () => {
  it('should render', () => {
    expect(render(<PubSubPage />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn()
    sendPageViewTelemetry.mockImplementation(() => sendPageViewTelemetryMock)

    render(<PubSubPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.PUBSUB_PAGE,
      eventData: {
        databaseId: 'instanceId',
      },
    })
  })
})
