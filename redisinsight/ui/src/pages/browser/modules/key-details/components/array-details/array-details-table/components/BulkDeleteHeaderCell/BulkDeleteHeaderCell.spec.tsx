import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { BulkDeleteHeaderCell } from './BulkDeleteHeaderCell'

describe('BulkDeleteHeaderCell', () => {
  it('renders nothing when nothing is selected', () => {
    const { container } = render(
      <BulkDeleteHeaderCell
        bulkDeleteConfig={{ selectedCount: 0, handleBulkDelete: jest.fn() }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('confirms before bulk-deleting, with the count in the popover', async () => {
    const handleBulkDelete = jest.fn()
    render(
      <BulkDeleteHeaderCell
        bulkDeleteConfig={{ selectedCount: 2, handleBulkDelete }}
      />,
    )

    fireEvent.click(screen.getByTestId('array-bulk-remove-btn-icon'))
    expect(
      await screen.findByText(
        /2 selected elements will be permanently removed/,
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('array-bulk-remove-btn'))
    expect(handleBulkDelete).toHaveBeenCalledTimes(1)
  })

  it('drops an open confirm popover when the selection empties', async () => {
    const { rerender } = render(
      <BulkDeleteHeaderCell
        bulkDeleteConfig={{ selectedCount: 2, handleBulkDelete: jest.fn() }}
      />,
    )

    fireEvent.click(screen.getByTestId('array-bulk-remove-btn-icon'))
    expect(
      await screen.findByTestId('array-bulk-remove-btn'),
    ).toBeInTheDocument()

    // Selection clears (a new range/search) — the trigger disappears.
    rerender(
      <BulkDeleteHeaderCell
        bulkDeleteConfig={{ selectedCount: 0, handleBulkDelete: jest.fn() }}
      />,
    )
    expect(
      screen.queryByTestId('array-bulk-remove-btn-icon'),
    ).not.toBeInTheDocument()

    // A later selection reopens the trigger with the popover closed.
    rerender(
      <BulkDeleteHeaderCell
        bulkDeleteConfig={{ selectedCount: 3, handleBulkDelete: jest.fn() }}
      />,
    )
    expect(screen.getByTestId('array-bulk-remove-btn-icon')).toBeInTheDocument()
    expect(
      screen.queryByTestId('array-bulk-remove-btn'),
    ).not.toBeInTheDocument()
  })
})
