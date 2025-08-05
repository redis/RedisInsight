import React from 'react'
import { render } from '@testing-library/react'
import { RiHorizontalRule } from './RiHorizontalRule'

describe('RiHorizontalRule', () => {
  it('should render with default props', () => {
    const { container } = render(<RiHorizontalRule />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toHaveStyle('width: 100%')
  })

  it('should render with set size and margin', () => {
    const { container } = render(<RiHorizontalRule size="half" margin="xs" />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toHaveStyle('width: 50%')
    expect(container.firstChild).toHaveStyle('margin-inline: auto')
  })
})
