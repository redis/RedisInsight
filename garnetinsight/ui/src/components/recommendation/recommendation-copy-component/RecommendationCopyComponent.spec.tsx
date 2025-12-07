import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, fireEvent, act, screen } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import RecommendationCopyComponent, {
  IProps,
} from './RecommendationCopyComponent'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockProvider = 'PROVIDER'

const mockTelemetryEvent = 'recommendationName'

describe('RecommendationCopyComponent', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn() },
    })
  })

  it('should render', () => {
    expect(
      render(<RecommendationCopyComponent {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('event telemetry INSIGHTS_RECOMMENDATION_KEY_COPIED should be call after click on copy btn', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <RecommendationCopyComponent
        {...instance(mockedProps)}
        live
        provider={mockProvider}
        telemetryEvent={mockTelemetryEvent}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-key-name-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_KEY_COPIED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: mockTelemetryEvent,
        provider: mockProvider,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('event telemetry DATABASE_RECOMMENDATIONS_KEY_COPIED should be call after click on copy btn', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(
      <RecommendationCopyComponent
        {...instance(mockedProps)}
        provider={mockProvider}
        telemetryEvent={mockTelemetryEvent}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-key-name-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.DATABASE_TIPS_KEY_COPIED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: mockTelemetryEvent,
        provider: mockProvider,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
