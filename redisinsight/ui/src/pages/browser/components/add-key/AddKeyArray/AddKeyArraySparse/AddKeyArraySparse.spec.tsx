import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddKeyArraySparse from './AddKeyArraySparse'
import { AddKeyArraySparseProps } from './AddKeyArraySparse.types'

const defaultProps: AddKeyArraySparseProps = {
  value: { elements: [{ id: 0, index: '', value: '' }] },
  onChange: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<AddKeyArraySparseProps>) =>
  render(<AddKeyArraySparse {...defaultProps} {...propsOverride} />)

describe('AddKeyArraySparse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render a single index/value row', () => {
    renderComponent()

    expect(screen.getByTestId('sparse-index-0')).toBeInTheDocument()
    expect(screen.getByTestId('sparse-value-0')).toBeInTheDocument()
  })

  it('should report the digit-stripped index on change', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.change(screen.getByTestId('sparse-index-0'), {
      target: { value: 'abc12def' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      elements: [{ id: 0, index: '12', value: '' }],
    })
  })

  it('should report a new element when a row is added', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.click(screen.getByTestId('add-item'))

    expect(onChange).toHaveBeenLastCalledWith({
      elements: [
        { id: 0, index: '', value: '' },
        { id: 1, index: '', value: '' },
      ],
    })
  })

  it('should report the remaining elements when a row is removed', () => {
    const onChange = jest.fn()
    renderComponent({
      value: {
        elements: [
          { id: 0, index: '0', value: 'a' },
          { id: 1, index: '5', value: 'b' },
        ],
      },
      onChange,
    })

    fireEvent.click(screen.getAllByTestId('remove-item')[1])

    expect(onChange).toHaveBeenLastCalledWith({
      elements: [{ id: 0, index: '0', value: 'a' }],
    })
  })

  it('should report an updated value on change', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.change(screen.getByTestId('sparse-value-0'), {
      target: { value: 'answer' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      elements: [{ id: 0, index: '', value: 'answer' }],
    })
  })

  it('should disable inputs when the disabled prop is set', () => {
    renderComponent({ disabled: true })

    expect(screen.getByTestId('sparse-index-0')).toBeDisabled()
    expect(screen.getByTestId('sparse-value-0')).toBeDisabled()
  })
})
