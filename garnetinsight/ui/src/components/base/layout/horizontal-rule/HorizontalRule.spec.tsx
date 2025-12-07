import React from 'react'
import { render } from '@testing-library/react'
import HorizontalRule from './HorizontalRule'

describe('HorizontalRule', () => {
  it('should render with default props', () => {
    const { container } = render(<HorizontalRule />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toHaveStyle('width: 100%')
  })

  it('should render with set size and margin', () => {
    const { container } = render(<HorizontalRule size="half" margin="xs" />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toHaveStyle('width: 50%')
    expect(container.firstChild).toHaveStyle('margin-inline: auto')
  })
})
