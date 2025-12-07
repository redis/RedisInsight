import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act } from '@testing-library/react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { SubmitBtnText } from 'uiSrc/pages/home/constants'
import ManualConnectionFrom, {
  Props as ManualConnectionFromProps,
} from 'uiSrc/pages/home/components/manual-connection/manual-connection-form/ManualConnectionForm'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ManualConnectionWrapper, { Props } from './ManualConnectionWrapper'

const mockedProps = mock<Props>()

jest.mock('./manual-connection-form/ManualConnectionForm', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockManualConnectionFrom = (props: ManualConnectionFromProps) => (
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
      onClick={() => props.onClose()}
      data-testid="onClose-btn"
    >
      onClose
    </button>
    <button
      type="submit"
      data-testid="btn-submit"
      onClick={() => props.onSubmit({})}
    >
      {props.submitButtonText}
    </button>
    <button
      type="button"
      onClick={() => props.setIsCloneMode(!props.isCloneMode)}
      data-testid="onClone-btn"
    >
      onClone
    </button>
  </div>
)

describe('ManualConnectionWrapper', () => {
  beforeAll(() => {
    ManualConnectionFrom.mockImplementation(mockManualConnectionFrom)
  })
  it('should render', () => {
    expect(
      render(<ManualConnectionWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should call onHostNamePaste', () => {
    const component = render(
      <ManualConnectionWrapper {...instance(mockedProps)} />,
    )
    fireEvent.click(screen.getByTestId('onHostNamePaste-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(
      <ManualConnectionWrapper {...instance(mockedProps)} onClose={onClose} />,
    )
    fireEvent.click(screen.getByTestId('onClose-btn'))
    expect(onClose).toBeCalled()
  })

  it('should have add database submit button', () => {
    render(<ManualConnectionWrapper {...instance(mockedProps)} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(
      SubmitBtnText.AddDatabase,
    )
  })

  it('should have edit database submit button', () => {
    render(<ManualConnectionWrapper {...instance(mockedProps)} editMode />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(
      SubmitBtnText.EditDatabase,
    )
  })

  it('should have edit database submit button', () => {
    render(<ManualConnectionWrapper {...instance(mockedProps)} editMode />)
    act(() => {
      fireEvent.click(screen.getByTestId('onClone-btn'))
    })
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(
      SubmitBtnText.CloneDatabase,
    )
  })

  it('should call proper telemetry event on Add database', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockRestore()
    render(<ManualConnectionWrapper {...instance(mockedProps)} />)
    act(() => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED,
    })
  })

  it('should call proper telemetry event on Clone database', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockRestore()
    render(<ManualConnectionWrapper {...instance(mockedProps)} editMode />)
    act(() => {
      fireEvent.click(screen.getByTestId('onClone-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('onClose-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: { databaseId: undefined },
    })
  })
})
