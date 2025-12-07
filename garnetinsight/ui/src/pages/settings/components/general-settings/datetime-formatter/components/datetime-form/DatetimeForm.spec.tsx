import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { dateTimeOptions } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import DatetimeForm, { Props } from './DatetimeForm'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsConfigSelector: jest.fn().mockReturnValue({
    dateFormat: null,
    timezone: null,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DatetimeForm', () => {
  it('should render', () => {
    expect(render(<DatetimeForm {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not show custom btn and input unless custom radio btn is clicked ', async () => {
    const { container } = render(<DatetimeForm {...instance(mockedProps)} />)
    expect(screen.getByText('Pre-selected formats')).toBeTruthy()
    expect(
      container.querySelector('[data-test-subj="select-datetime"]'),
    ).toBeTruthy()
    expect(screen.queryByTestId('datetime-custom-btn')).toBeFalsy()
    await act(() => fireEvent.click(screen.getByText('Custom')))
    expect(screen.queryByTestId('datetime-custom-btn')).toBeTruthy()
  })

  it('should display invalid format when wrong format is typed in a custom input', async () => {
    const onFormatChange = jest.fn()
    render(
      <DatetimeForm
        {...instance(mockedProps)}
        onFormatChange={onFormatChange}
      />,
    )

    await act(() => fireEvent.click(screen.getByText('Custom')))
    const customInput: Nullable<HTMLElement> = screen.getByTestId(
      'custom-datetime-input',
    )

    await act(() =>
      fireEvent.change(customInput, { target: { value: 'fffffinvalid' } }),
    )

    expect(onFormatChange).toBeCalledWith('Invalid Format')
  })

  it('should call proper telemetry events when custom format is saved', async () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<DatetimeForm {...instance(mockedProps)} />)

    await act(() => fireEvent.click(screen.getByText('Custom')))
    const customInput: Nullable<HTMLElement> = screen.getByTestId(
      'custom-datetime-input',
    )

    await act(() =>
      fireEvent.change(customInput, {
        target: { value: dateTimeOptions[1].value },
      }),
    )
    await act(() => fireEvent.click(screen.getByTestId('datetime-custom-btn')))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: dateTimeOptions[1].value,
      },
    })
  })

  it('should call proper telemetry events when radio option is changed to common', async () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<DatetimeForm {...instance(mockedProps)} />)

    await act(() => fireEvent.click(screen.getByText('Custom')))
    await act(() => fireEvent.click(screen.getByText('Pre-selected formats')))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: dateTimeOptions[0].value,
      },
    })
  })

  it('should call sendEventTelemetry when common formats is changed', async () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<DatetimeForm {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('select-datetime-testid'))
    await act(() =>
      fireEvent.click(screen.queryByText(dateTimeOptions[1].value) || document),
    )
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: dateTimeOptions[1].value,
      },
    })
  })
})
