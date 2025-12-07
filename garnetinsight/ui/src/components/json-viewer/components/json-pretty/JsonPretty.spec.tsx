import React from 'react'
import JSONBigInt from 'json-bigint'
import { render, screen } from 'uiSrc/utils/test-utils'

import JsonPretty from './JsonPretty'

describe('JsonPretty', () => {
  it('should render jsonObjectComponent', () => {
    const json = { value: JSON.stringify({}) }
    render(<JsonPretty data={json} />)

    expect(screen.getByTestId('json-object-component')).toBeInTheDocument()
  })

  it('should render json array component', () => {
    const json = ['123']
    render(<JsonPretty data={json} />)

    expect(screen.getByTestId('json-array-component')).toBeInTheDocument()
  })

  it('should render json primitive component', () => {
    const json = null
    render(<JsonPretty data={json} />)

    expect(screen.getByTestId('json-primitive-component')).toBeInTheDocument()
  })

  it('should render json primitive component with big number', () => {
    const json = JSONBigInt({ useNativeBigInt: true }).parse(
      '1234567890123456789012345678901234567890',
    )
    render(<JsonPretty data={json} />)
    expect(screen.getByTestId('json-primitive-component')).toBeInTheDocument()
  })

  it('should render json primitive component with big float', () => {
    const json = JSONBigInt({ useNativeBigInt: false }).parse(
      '1234567890123456789012345678901234567890.1234567890123456789012345678901234567890',
    )
    render(<JsonPretty data={json} />)
    expect(screen.getByTestId('json-primitive-component')).toBeInTheDocument()
  })
})
