import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'

import { SubscriptionCellRenderer } from './SubscriptionCell'

describe('SubscriptionCellRenderer', () => {
  it('should render subscription name', () => {
    const name = 'test-subscription'
    render(<SubscriptionCellRenderer name={name} />)

    expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('should truncate long names to 200 characters', () => {
    const longName = 'a'.repeat(300)
    const truncatedText = 'a'.repeat(200)
    expect(truncatedText).not.toEqual(longName)
    render(<SubscriptionCellRenderer name={longName} />)

    const displayedText = screen.getByText(truncatedText)
    expect(displayedText).toBeInTheDocument()
    expect(screen.getByRole('presentation').textContent).toEqual(truncatedText)
  })

  it('should replace consecutive spaces with non-breaking spaces', () => {
    const nameWithDoubleSpaces = 'my  subscription  name'
    render(<SubscriptionCellRenderer name={nameWithDoubleSpaces} />)

    // replaceSpaces replaces consecutive spaces (2+) with non-breaking spaces (\u00a0)
    const element = screen.getByRole('presentation')
    const textContent = element.textContent || ''
    // Check that non-breaking space character (\u00a0) is present
    expect(textContent).toContain('\u00a0\u00a0')
  })

  it('should apply custom className', () => {
    const name = 'test-sub'
    const customClass = 'custom-class'
    const { container } = render(
      <SubscriptionCellRenderer name={name} className={customClass} />,
    )

    const element = container.querySelector(`.${customClass}`)
    expect(element).toBeInTheDocument()
  })
})
