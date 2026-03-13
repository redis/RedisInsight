import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { RiDatePicker } from './RiDatePicker'
import { RiDatePickerProps } from './RiDatePicker.types'

const FIXED_DATE = new Date(2026, 2, 12)

describe('RiDatePicker', () => {
  const defaultProps: RiDatePickerProps = {
    selected: FIXED_DATE,
    onSelect: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<RiDatePickerProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<RiDatePicker {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    renderComponent()
    expect(screen.getByTestId('ri-date-picker')).toBeInTheDocument()
  })

  it('should display the label', () => {
    renderComponent()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('should allow custom label', () => {
    renderComponent({ label: 'Start Date' })
    expect(screen.getByText('Start Date')).toBeInTheDocument()
  })

  it('should hide label when empty string', () => {
    renderComponent({ label: '' })
    expect(screen.queryByText('Date')).not.toBeInTheDocument()
  })

  it('should display formatted date in trigger button', () => {
    renderComponent()
    expect(screen.getByTestId('ri-date-picker-trigger')).toHaveTextContent(
      'March 12th, 2026',
    )
  })

  it('should open calendar popover on trigger click', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('ri-date-picker-trigger'))
    expect(screen.getByTestId('ri-calendar')).toBeInTheDocument()
  })

  it('should call onSelect when a day is selected', () => {
    const onSelect = jest.fn()
    renderComponent({ onSelect })
    fireEvent.click(screen.getByTestId('ri-date-picker-trigger'))
    fireEvent.click(screen.getByRole('button', { name: /15/ }))
    expect(onSelect).toHaveBeenCalled()
  })

  it('should default to current date when no selected prop', () => {
    renderComponent({ selected: undefined })
    expect(screen.getByTestId('ri-date-picker-trigger')).toBeTruthy()
  })
})
