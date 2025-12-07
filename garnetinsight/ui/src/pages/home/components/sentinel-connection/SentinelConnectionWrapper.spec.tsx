import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import SentinelConnectionForm, {
  Props as SentinelConnectionFormProps,
} from 'uiSrc/pages/home/components/sentinel-connection/sentinel-connection-form/SentinelConnectionForm'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import SentinelConnectionWrapper, { Props } from './SentinelConnectionWrapper'

const mockedProps = mock<Props>()

jest.mock('./sentinel-connection-form/SentinelConnectionForm', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockSentinelConnectionForm = (props: SentinelConnectionFormProps) => (
  <div>
    <button
      type="button"
      onClick={() => props.onHostNamePaste('redis-12000.cluster.local:12000')}
      data-testid="onHostNamePaste-btn"
    >
      onHostNamePaste
    </button>
    <button
      type="button"
      onClick={() => props.onSubmit({})}
      data-testid="onSubmit-btn"
    >
      onSubmit
    </button>
    <button
      type="button"
      onClick={() => props.onClose()}
      data-testid="onClose-btn"
    >
      onClose
    </button>
  </div>
)

describe('SentinelConnectionWrapper', () => {
  beforeAll(() => {
    SentinelConnectionForm.mockImplementation(mockSentinelConnectionForm)
  })
  it('should render', () => {
    expect(
      render(<SentinelConnectionWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should call onHostNamePaste', () => {
    const component = render(
      <SentinelConnectionWrapper {...instance(mockedProps)} />,
    )
    fireEvent.click(screen.getByTestId('onHostNamePaste-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(
      <SentinelConnectionWrapper
        {...instance(mockedProps)}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByTestId('onClose-btn'))
    expect(onClose).toBeCalled()
  })

  it('Should call proper telemetry event', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<SentinelConnectionWrapper {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('onSubmit-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event:
        TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED,
    })

    sendEventTelemetry.mockRestore()
  })
})
