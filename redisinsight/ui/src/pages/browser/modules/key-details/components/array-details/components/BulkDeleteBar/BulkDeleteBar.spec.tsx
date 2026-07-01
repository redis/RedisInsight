import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { BulkDeleteBar } from './BulkDeleteBar'

describe('BulkDeleteBar', () => {
  it('renders nothing when nothing is selected', () => {
    const { container } = render(
      <BulkDeleteBar
        selectedCount={0}
        onBulkDelete={jest.fn()}
        onClear={jest.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the selected count and clears the selection', () => {
    const onClear = jest.fn()
    render(
      <BulkDeleteBar
        selectedCount={3}
        onBulkDelete={jest.fn()}
        onClear={onClear}
      />,
    )

    expect(screen.getByText('3 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('array-bulk-clear-btn'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('confirms before bulk-deleting the selection', async () => {
    const onBulkDelete = jest.fn()
    render(
      <BulkDeleteBar
        selectedCount={2}
        onBulkDelete={onBulkDelete}
        onClear={jest.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('array-bulk-remove-btn-icon'))
    fireEvent.click(await screen.findByTestId('array-bulk-remove-btn'))

    expect(onBulkDelete).toHaveBeenCalledTimes(1)
  })
})
