import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { IndexSelect } from './IndexSelect'

// Mock RiSelect to a simple native select so we can simulate change easily
jest.mock('uiSrc/components/base/forms/select/RiSelect', () => {
  const React = require('react')
  return {
    RiSelect: ({ options, value, onChange, ...rest }: any) =>
      React.createElement(
        'select',
        {
          'data-testid': 'select-saved-index',
          value,
          onChange: (e: any) => onChange(e.target.value),
          ...rest,
        },
        options?.map((o: any) =>
          React.createElement(
            'option',
            { key: o.value, value: o.value },
            o.value,
          ),
        ),
      ),
  }
})

const mockIndexes = [
  { value: 'idx:bikes_vss', tags: ['tag', 'text'], queries: [] },
  { value: 'idx:restaurants_vss', tags: ['vector'], queries: [] },
]

describe('IndexSelect', () => {
  it('renders label and select', () => {
    const onIndexChange = jest.fn()
    const { container } = render(
      <IndexSelect
        savedIndexes={mockIndexes as any}
        selectedIndex={mockIndexes[0].value}
        onIndexChange={onIndexChange}
      />,
    )

    expect(container).toBeTruthy()
    expect(screen.getByText('Index:')).toBeInTheDocument()
    expect(screen.getByTestId('select-saved-index')).toBeInTheDocument()
  })

  it('calls onIndexChange when selection changes', () => {
    const onIndexChange = jest.fn()
    render(
      <IndexSelect
        savedIndexes={mockIndexes as any}
        selectedIndex={mockIndexes[0].value}
        onIndexChange={onIndexChange}
      />,
    )

    const select = screen.getByTestId('select-saved-index') as HTMLSelectElement
    fireEvent.change(select, { target: { value: mockIndexes[1].value } })

    expect(onIndexChange).toHaveBeenCalledTimes(1)
    expect(onIndexChange).toHaveBeenCalledWith('idx:restaurants_vss')
  })
})
