import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { KeyTypeOption, KeyTypeOptionProps } from './KeyTypeOption'

const defaultProps: KeyTypeOptionProps = {
  option: {
    text: 'common.keyType.vectorSet',
    value: KeyTypes.VectorSet,
    color: 'blue',
    minVersion: '8.0',
  },
}

const renderComponent = (propsOverride?: Partial<KeyTypeOptionProps>) =>
  render(<KeyTypeOption {...defaultProps} {...propsOverride} />)

describe('KeyTypeOption', () => {
  it('should render only the label when enabled', () => {
    renderComponent({ disabled: false })

    expect(screen.getByTestId(KeyTypes.VectorSet)).toBeInTheDocument()
    expect(
      screen.queryByTestId(`${KeyTypes.VectorSet}-disabled`),
    ).not.toBeInTheDocument()
  })

  it('should render a disabled row with the label when disabled', () => {
    renderComponent({ disabled: true })

    expect(screen.getByText('Vector Set')).toBeInTheDocument()
    expect(
      screen.getByTestId(`${KeyTypes.VectorSet}-disabled`),
    ).toBeInTheDocument()
  })

  it('should not render the disabled row when the type has no minVersion', () => {
    renderComponent({
      option: {
        text: 'common.keyType.hash',
        value: KeyTypes.Hash,
        color: 'blue',
      },
      disabled: true,
    })

    expect(
      screen.queryByTestId(`${KeyTypes.Hash}-disabled`),
    ).not.toBeInTheDocument()
  })
})
