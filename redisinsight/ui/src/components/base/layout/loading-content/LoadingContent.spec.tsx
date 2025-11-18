import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import LoadingContent from './LoadingContent'

describe('LoadingContent', () => {
  it('should render the component', () => {
    const { container } = render(<LoadingContent />)
    expect(container.firstChild).toHaveClass('RI-loading-content')
  })

  it('should render the default number of lines (3)', () => {
    const { container } = render(<LoadingContent />)
    const lines = container.querySelectorAll('.RI-loading-content > span')
    expect(lines.length).toBe(3)
  })

  it('should render the correct number of lines when "lines" prop is passed', () => {
    const { container } = render(<LoadingContent lines={5} />)
    const lines = container.querySelectorAll('.RI-loading-content > span')
    expect(lines.length).toBe(5)
  })

  it('should apply the custom className if provided', () => {
    const { container } = render(<LoadingContent className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
