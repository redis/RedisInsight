import React from 'react'
import { render } from '@testing-library/react'
import { RiLoadingContent } from 'uiSrc/components'

describe('RiLoadingContent', () => {
  it('should render the component', () => {
    const { container } = render(<RiLoadingContent />)
    expect(container.firstChild).toHaveClass('RI-loading-content')
  })

  it('should render the default number of lines (3)', () => {
    const { container } = render(<RiLoadingContent />)
    const lines = container.querySelectorAll('.RI-loading-content > span')
    expect(lines.length).toBe(3)
  })

  it('should render the correct number of lines when "lines" prop is passed', () => {
    const { container } = render(<RiLoadingContent lines={5} />)
    const lines = container.querySelectorAll('.RI-loading-content > span')
    expect(lines.length).toBe(5)
  })

  it('should apply the custom className if provided', () => {
    const { container } = render(<RiLoadingContent className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
