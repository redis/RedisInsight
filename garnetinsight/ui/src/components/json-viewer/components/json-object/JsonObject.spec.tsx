import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JsonObject from './JsonObject'

const mockJson = { value: JSON.stringify({}) }

describe('JsonObject', () => {
  it('should render jsonObjectComponent', () => {
    expect(render(<JsonObject data={mockJson} />)).toBeTruthy()
  })

  it('should render jsonObjectComponent', () => {
    render(<JsonObject data={mockJson} gap={8} />)

    expect(screen.getByTestId('json-object-component')).toHaveTextContent(
      '{ "value": "{}" }',
    )
  })

  it('should render coma', () => {
    render(<JsonObject data={mockJson} lastElement={false} />)

    expect(screen.getByTestId('json-object-component')).toHaveTextContent(
      '{ "value": "{}" },',
    )
  })

  it('should not render coma', () => {
    render(<JsonObject data={mockJson} lastElement />)

    expect(screen.getByTestId('json-object-component')).toHaveTextContent(
      '{ "value": "{}" }',
    )
  })

  it('should not render empty space and line break', () => {
    render(<JsonObject data={{}} lastElement />)

    expect(screen.getByTestId('json-object-component')).toHaveTextContent(
      '{}',
      { normalizeWhitespace: false },
    )
  })

  it('should render empty space and line break', () => {
    const renderedObject = '{\n  "value": "{}"\n}'
    render(<JsonObject data={mockJson} lastElement />)

    expect(screen.getByTestId('json-object-component')).toHaveTextContent(
      renderedObject,
      { normalizeWhitespace: false },
    )
  })
})
