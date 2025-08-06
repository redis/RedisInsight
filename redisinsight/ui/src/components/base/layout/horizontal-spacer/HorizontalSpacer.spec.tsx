import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { RiHorizontalSpacer } from './RiHorizontalSpacer'

describe('HorizontalSpacer', () => {
  it('should render with different sizes correctly', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const

    sizes.forEach((size) => {
      const { container } = render(<RiHorizontalSpacer size={size} />)
      const spacer = container.querySelector(
        '.RI-horizontal-spacer',
      ) as HTMLElement

      if (size === 'xl') {
        expect(spacer).toHaveStyle('width: calc(var(--base) * 2.25)')
      } else {
        expect(spacer).toHaveStyle(`width: var(--size-${size})`)
      }
    })
  })

  it('should render children when provided', () => {
    const { getByText } = render(
      <RiHorizontalSpacer size="s">
        <span>Test content</span>
      </RiHorizontalSpacer>,
    )
    const content = getByText('Test content')
    expect(content).toBeInTheDocument()
    expect(content.parentElement).toHaveStyle('width: var(--size-s)')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <RiHorizontalSpacer className="custom-class" />,
    )
    const spacer = container.querySelector(
      '.RI-horizontal-spacer',
    ) as HTMLElement

    expect(spacer).toHaveClass('RI-horizontal-spacer')
    expect(spacer).toHaveClass('custom-class')
  })

  it('should pass through custom props', () => {
    const { container } = render(
      <RiHorizontalSpacer data-testid="my-spacer" id="spacer-id" />,
    )
    const spacer = container.querySelector(
      '.RI-horizontal-spacer',
    ) as HTMLElement

    expect(spacer).toHaveAttribute('data-testid', 'my-spacer')
    expect(spacer).toHaveAttribute('id', 'spacer-id')
  })
})
