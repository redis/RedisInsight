import React, { useState } from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { SparseValue } from '../AddKeyArray.types'
import AddKeyArraySparse from './AddKeyArraySparse'
import { Props } from './AddKeyArraySparse.types'

const INITIAL_VALUE: SparseValue = {
  elements: [{ id: 0, index: '', value: '' }],
}

describe('AddKeyArraySparse', () => {
  // Controlled component: a small stateful harness mirrors the parent so edits
  // round-trip through `value`, and the spy records every reported change.
  const renderComponent = (propsOverride?: Partial<Props>) => {
    const onChange = propsOverride?.onChange ?? jest.fn()
    const Harness = () => {
      const [value, setValue] = useState<SparseValue>(
        propsOverride?.value ?? INITIAL_VALUE,
      )
      return (
        <AddKeyArraySparse
          disabled={propsOverride?.disabled}
          value={value}
          onChange={(next) => {
            setValue(next)
            onChange(next)
          }}
        />
      )
    }
    return { onChange, ...render(<Harness />) }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with a single index/value row', () => {
    renderComponent()

    expect(screen.getByTestId('sparse-index')).toBeInTheDocument()
    expect(screen.getByTestId('sparse-value')).toBeInTheDocument()
  })

  it('should keep only digits when typing into the index input', () => {
    renderComponent()

    const sparseIndex = screen.getByTestId('sparse-index')
    fireEvent.change(sparseIndex, { target: { value: 'abc12def' } })

    expect(sparseIndex).toHaveValue('12')
  })

  it('should allow adding and removing element rows', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('add-item'))
    expect(screen.getAllByTestId('sparse-index')).toHaveLength(2)
    expect(screen.getAllByTestId('sparse-value')).toHaveLength(2)

    fireEvent.click(screen.getAllByTestId('remove-item')[1])
    expect(screen.getAllByTestId('sparse-index')).toHaveLength(1)
  })

  it('should report updated elements on change', () => {
    const { onChange } = renderComponent()

    fireEvent.change(screen.getByTestId('sparse-index'), {
      target: { value: '42' },
    })
    fireEvent.change(screen.getByTestId('sparse-value'), {
      target: { value: 'answer' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      elements: [{ id: 0, index: '42', value: 'answer' }],
    })
  })

  it('should disable inputs when the disabled prop is set', () => {
    renderComponent({ disabled: true })

    expect(screen.getByTestId('sparse-index')).toBeDisabled()
    expect(screen.getByTestId('sparse-value')).toBeDisabled()
  })
})
