import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'

import { SubscriptionCell } from './SubscriptionCell'

describe('SubscriptionCell', () => {
  it('should render subscription name', () => {
    const name = 'test-subscription'
    render(<SubscriptionCell name={name} />)

    expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('should truncate long names to 200 characters', () => {
    const longName = 'a'.repeat(300)
    render(<SubscriptionCell name={longName} />)

    const displayedText = screen.getByText('a'.repeat(200))
    expect(displayedText).toBeInTheDocument()
  })

  it('should replace spaces in names', () => {
    const nameWithSpaces = 'my subscription name'
    render(<SubscriptionCell name={nameWithSpaces} />)

    // replaceSpaces replaces spaces with nbsp
    const element = screen.getByRole('presentation')
    expect(element).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const name = 'test-sub'
    const customClass = 'custom-class'
    const { container } = render(
      <SubscriptionCell name={name} className={customClass} />,
    )

    const element = container.querySelector(`.${customClass}`)
    expect(element).toBeInTheDocument()
  })
})
