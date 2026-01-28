import React from 'react'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { dateTimeOptions } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import DateTimeFormatter from './DateTimeFormatter'

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

describe('DateTimeFormatter', () => {
  it('should render', () => {
    expect(render(<DateTimeFormatter />)).toBeTruthy()
  })

  it('should not show custom btn and input unless custom radio btn is clicked ', async () => {
    const { container } = render(<DateTimeFormatter />)
    expect(screen.getByText('Pre-selected formats')).toBeInTheDocument()
    expect(
      container.querySelector('[data-test-subj="select-datetime"]'),
    ).toBeTruthy()
    expect(screen.queryByTestId('datetime-custom-btn')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Custom'))
    expect(screen.queryByTestId('datetime-custom-btn')).toBeInTheDocument()
  })

  it('should display invalid format when wrong format is typed in a custom input', async () => {
    const { getByDisplayValue } = render(<DateTimeFormatter />)

    await act(() => fireEvent.click(screen.getByText('Custom')))
    const customInput: Nullable<HTMLElement> = screen.getByTestId(
      'custom-datetime-input',
    )

    await act(async () =>
      fireEvent.change(customInput, { target: { value: 'fffffinvalid' } }),
    )

    expect(getByDisplayValue('Invalid Format')).toBeInTheDocument()
  })

  it('should call proper telemetry events', async () => {
    render(<DateTimeFormatter />)

    await act(async () => fireEvent.click(screen.getByText('Custom')))
    const customInput: Nullable<HTMLElement> = screen.getByTestId(
      'custom-datetime-input',
    )

    await act(async () =>
      fireEvent.change(customInput, {
        target: { value: dateTimeOptions[1].value },
      }),
    )
    await act(() => fireEvent.click(screen.getByTestId('datetime-custom-btn')))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: dateTimeOptions[1].value,
      },
    })
  })
})
