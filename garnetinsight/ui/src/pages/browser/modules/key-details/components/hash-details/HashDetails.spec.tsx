import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { Props, HashDetails } from './HashDetails'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceOverviewSelector: jest.fn().mockReturnValue({
    version: '7.4.2',
  }),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    hashFieldExpiration: { flag: true },
  }),
}))

describe('HashDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render', () => {
    expect(render(<HashDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render subheader', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })

  it('opens and closes the add item panel', () => {
    render(
      <HashDetails
        {...instance(mockedProps)}
        onOpenAddItemPanel={() => {}}
        onCloseAddItemPanel={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    expect(screen.getByText('Save')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  describe('when hashFieldFeatureFlag and version higher 7.3', () => {
    it('renders subheader with checkbox', () => {
      render(<HashDetails {...instance(mockedProps)} />)
      expect(screen.getByText('Show TTL')).toBeInTheDocument()
    })

    it('toggles the show TTL button', async () => {
      render(<HashDetails {...instance(mockedProps)} />)
      let el = screen.getByTestId('test-check-ttl') as HTMLInputElement
      expect(el).toHaveAttribute('aria-checked', 'true')
      // expect(el.checked).toBe(true)
      await act(async () => {
        fireEvent.click(el)
      })
      el = screen.getByTestId('test-check-ttl') as HTMLInputElement
      expect(el).toHaveAttribute('aria-checked', 'false')
      // expect(el.checked).toBe(false)
    })

    it('should call proper telemetry event after click on showTtl', () => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      render(<HashDetails {...instance(mockedProps)} />)

      fireEvent.click(screen.getByTestId('test-check-ttl'))

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SHOW_HASH_TTL_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          action: 'hide',
        },
      })

      fireEvent.click(screen.getByTestId('test-check-ttl'))

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SHOW_HASH_TTL_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          action: 'show',
        },
      })
    })
  })
})
