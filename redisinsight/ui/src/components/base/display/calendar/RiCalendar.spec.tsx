import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { RiCalendar } from './RiCalendar'

const FIXED_DATE = new Date(2026, 2, 12)

describe('RiCalendar', () => {
  const renderComponent = (propsOverride = {}) =>
    render(
      <RiCalendar mode="single" defaultMonth={FIXED_DATE} {...propsOverride} />,
    )

  it('should render calendar root', () => {
    renderComponent()
    expect(screen.getByTestId('ri-calendar')).toBeInTheDocument()
  })

  it('should render month caption', () => {
    renderComponent()
    expect(screen.getByText('March 2026')).toBeInTheDocument()
  })

  it('should render weekday headers', () => {
    renderComponent()
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
  })

  it('should render day buttons', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /12/ })).toBeInTheDocument()
  })

  it('should highlight selected day', () => {
    renderComponent({ selected: FIXED_DATE })
    const day12 = screen.getByRole('button', { name: /12/ })
    expect(day12.closest('[data-selected]')).toBeTruthy()
  })

  it('should call onSelect when a day is clicked', () => {
    const onSelect = jest.fn()
    renderComponent({ onSelect })
    fireEvent.click(screen.getByRole('button', { name: /15/ }))
    expect(onSelect).toHaveBeenCalled()
  })

  it('should navigate to next month', () => {
    renderComponent()
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    expect(screen.getByText('April 2026')).toBeInTheDocument()
  })

  it('should show outside days by default', () => {
    renderComponent()
    const allDayButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.closest('td') !== null)
    expect(allDayButtons.length).toBeGreaterThan(28)
  })
})
