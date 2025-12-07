import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JsonArray from './JsonArray'

const mockArray = [123]

describe('JsonArray', () => {
  it('should render JsonArray', () => {
    expect(render(<JsonArray data={mockArray} />)).toBeTruthy()
  })

  it('should render jsonObjectComponent', () => {
    render(<JsonArray data={mockArray} gap={8} />)

    expect(screen.getByTestId('json-array-component')).toHaveTextContent(
      '[ 123 ]',
    )
  })

  it('should render coma', () => {
    render(<JsonArray data={mockArray} lastElement={false} />)

    expect(screen.getByTestId('json-array-component')).toHaveTextContent(
      '[ 123 ],',
    )
  })

  it('should not render coma', () => {
    render(<JsonArray data={mockArray} lastElement />)

    expect(screen.getByTestId('json-array-component')).toHaveTextContent(
      '[ 123 ]',
    )
  })

  it('should not render empty space and line break', () => {
    render(<JsonArray data={[]} lastElement />)

    expect(screen.getByTestId('json-array-component')).toHaveTextContent('[', {
      normalizeWhitespace: false,
    })
  })

  it('should render empty space and line break', () => {
    const renderedArray = '[\n  123\n]'
    render(<JsonArray data={mockArray} lastElement />)

    expect(screen.getByTestId('json-array-component')).toHaveTextContent(
      renderedArray,
      { normalizeWhitespace: false },
    )
  })
})
