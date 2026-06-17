import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddKeyArrayContiguous from './AddKeyArrayContiguous'
import { AddKeyArrayContiguousProps } from './AddKeyArrayContiguous.types'

const defaultProps: AddKeyArrayContiguousProps = {
  value: { startIndex: '0', values: [''] },
  onChange: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<AddKeyArrayContiguousProps>) =>
  render(<AddKeyArrayContiguous {...defaultProps} {...propsOverride} />)

const valueFindingRegex = /^value-\d+$/

describe('AddKeyArrayContiguous', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the provided start index and value row', () => {
    renderComponent()

    expect(screen.getByTestId('start-index')).toHaveValue('0')
    expect(screen.getByTestId(valueFindingRegex)).toBeInTheDocument()
  })

  it('should report the digit-stripped start index on change', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.change(screen.getByTestId('start-index'), {
      target: { value: '1a2b3c' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      startIndex: '123',
      values: [''],
    })
  })

  it('should report a new empty row when a value is added', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.click(screen.getByTestId('add-item'))

    expect(onChange).toHaveBeenLastCalledWith({
      startIndex: '0',
      values: ['', ''],
    })
  })

  it('should report the remaining rows when a value is removed', () => {
    const onChange = jest.fn()
    renderComponent({
      value: { startIndex: '0', values: ['a', 'b'] },
      onChange,
    })

    fireEvent.click(screen.getAllByTestId('remove-item')[1])

    expect(onChange).toHaveBeenLastCalledWith({
      startIndex: '0',
      values: ['a'],
    })
  })

  it('should report an updated value on change', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.change(screen.getByTestId('value-0'), {
      target: { value: 'first' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      startIndex: '0',
      values: ['first'],
    })
  })

  it('should disable inputs when the disabled prop is set', () => {
    renderComponent({ disabled: true })

    expect(screen.getByTestId('start-index')).toBeDisabled()
    expect(screen.getByTestId('value-0')).toBeDisabled()
  })
})
