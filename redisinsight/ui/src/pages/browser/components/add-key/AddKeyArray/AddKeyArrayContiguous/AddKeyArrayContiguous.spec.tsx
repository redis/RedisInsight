import React, { useState } from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ContiguousValue } from '../AddKeyArray.types'
import AddKeyArrayContiguous from './AddKeyArrayContiguous'
import { Props } from './AddKeyArrayContiguous.types'

const INITIAL_VALUE: ContiguousValue = { startIndex: '0', values: [''] }

const valueFindingRegex = /^value-\d+$/

describe('AddKeyArrayContiguous', () => {
  // Controlled component: a small stateful harness mirrors the parent so edits
  // round-trip through `value`, and the spy records every reported change.
  const renderComponent = (propsOverride?: Partial<Props>) => {
    const onChange = propsOverride?.onChange ?? jest.fn()
    const Harness = () => {
      const [value, setValue] = useState<ContiguousValue>(
        propsOverride?.value ?? INITIAL_VALUE,
      )
      return (
        <AddKeyArrayContiguous
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

  it('should render with the default start index and a single value row', () => {
    renderComponent()

    expect(screen.getByTestId('start-index')).toHaveValue('0')
    expect(screen.getByTestId(valueFindingRegex)).toBeInTheDocument()
  })

  it('should keep only digits when typing into the start index input', () => {
    renderComponent()

    const startIndex = screen.getByTestId('start-index')
    fireEvent.change(startIndex, { target: { value: '1a2b3c' } })

    expect(startIndex).toHaveValue('123')
  })

  it('should allow adding and removing value rows', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('add-item'))
    expect(screen.getAllByTestId(valueFindingRegex)).toHaveLength(2)

    fireEvent.click(screen.getAllByTestId('remove-item')[1])
    expect(screen.getAllByTestId(valueFindingRegex)).toHaveLength(1)
  })

  it('should report updated start index and values on change', () => {
    const { onChange } = renderComponent()

    fireEvent.change(screen.getByTestId('start-index'), {
      target: { value: '5' },
    })
    fireEvent.change(screen.getByTestId('value-0'), {
      target: { value: 'first' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      startIndex: '5',
      values: ['first'],
    })
  })

  it('should disable inputs when the disabled prop is set', () => {
    renderComponent({ disabled: true })

    expect(screen.getByTestId('start-index')).toBeDisabled()
    expect(screen.getByTestId('value-0')).toBeDisabled()
  })
})
