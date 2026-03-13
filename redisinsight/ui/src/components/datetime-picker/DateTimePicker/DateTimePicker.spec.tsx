import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import DateTimePicker from './DateTimePicker'
import { DateTimePickerProps } from './DateTimePicker.types'

const FIXED_DATE = new Date(2026, 2, 12, 14, 30, 45)

describe('DateTimePicker', () => {
  const defaultProps: DateTimePickerProps = {
    onSubmit: jest.fn(),
    initialDate: FIXED_DATE,
  }

  const renderComponent = (propsOverride?: Partial<DateTimePickerProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<DateTimePicker {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    renderComponent()
    expect(screen.getByTestId('datetime-picker')).toBeInTheDocument()
  })

  it('should render date picker, time picker, and timestamp output', () => {
    renderComponent()
    expect(screen.getByTestId('ri-date-picker')).toBeInTheDocument()
    expect(screen.getByTestId('ri-time-input')).toBeInTheDocument()
    expect(screen.getByTestId('datetime-picker-timestamp')).toBeInTheDocument()
    expect(screen.getByTestId('datetime-picker-insert')).toBeInTheDocument()
  })

  it('should initialize time picker with provided date time', () => {
    renderComponent()
    const input = screen.getByTestId('ri-time-input-field')
    expect(input).toHaveValue('14:30:45')
  })

  it('should show a timestamp value in seconds by default', () => {
    renderComponent()
    const timestampEl = screen.getByTestId('datetime-picker-timestamp')
    const ts = Number(timestampEl.textContent)
    expect(ts).toBe(Math.floor(FIXED_DATE.getTime() / 1000))
  })

  it('should show a timestamp value in milliseconds when configured', () => {
    renderComponent({ timestampUnit: 'milliseconds' })
    const timestampEl = screen.getByTestId('datetime-picker-timestamp')
    const ts = Number(timestampEl.textContent)
    expect(ts).toBe(FIXED_DATE.getTime())
  })

  it('should call onSubmit with seconds timestamp by default', () => {
    const onSubmit = jest.fn()
    renderComponent({ onSubmit })
    fireEvent.click(screen.getByTestId('datetime-picker-insert'))
    expect(onSubmit).toHaveBeenCalledWith(
      Math.floor(FIXED_DATE.getTime() / 1000),
    )
  })

  it('should call onSubmit with milliseconds timestamp when configured', () => {
    const onSubmit = jest.fn()
    renderComponent({ onSubmit, timestampUnit: 'milliseconds' })
    fireEvent.click(screen.getByTestId('datetime-picker-insert'))
    expect(onSubmit).toHaveBeenCalledWith(FIXED_DATE.getTime())
  })

  it('should render unit toggle with seconds active by default', () => {
    renderComponent()
    expect(screen.getByTestId('datetime-unit-seconds')).toBeInTheDocument()
    expect(screen.getByTestId('datetime-unit-milliseconds')).toBeInTheDocument()
  })

  it('should switch to milliseconds when toggle is clicked', () => {
    renderComponent()
    const secondsTs = Math.floor(FIXED_DATE.getTime() / 1000)
    expect(
      Number(screen.getByTestId('datetime-picker-timestamp').textContent),
    ).toBe(secondsTs)

    fireEvent.click(screen.getByTestId('datetime-unit-milliseconds'))
    expect(
      Number(screen.getByTestId('datetime-picker-timestamp').textContent),
    ).toBe(FIXED_DATE.getTime())
  })

  it('should update timestamp when time input changes', () => {
    renderComponent()
    const input = screen.getByTestId('ri-time-input-field')
    fireEvent.change(input, { target: { value: '10:00:00' } })

    const expected = new Date(FIXED_DATE)
    expected.setHours(10, 0, 0, 0)
    const expectedTs = Math.floor(expected.getTime() / 1000)

    expect(
      Number(screen.getByTestId('datetime-picker-timestamp').textContent),
    ).toBe(expectedTs)
  })
})
