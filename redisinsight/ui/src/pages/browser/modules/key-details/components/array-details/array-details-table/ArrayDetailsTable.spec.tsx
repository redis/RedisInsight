import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from 'uiSrc/utils/test-utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'

import { ArrayDetailsTable } from './ArrayDetailsTable'

const renderComponent = (
  elements: ArrayDataElement[],
  loading: boolean = false,
  error?: string,
) =>
  render(
    <ArrayDetailsTable elements={elements} loading={loading} error={error} />,
  )

describe('ArrayDetailsTable', () => {
  it('renders an index cell for each element', () => {
    // Pin the indexes the assertions look for — including the u64 boundary
    // case (2^64 - 6) — instead of relying on the factory sequence.
    renderComponent([
      arrayElementFactory.build({ index: '0' }),
      arrayElementFactory.build({ index: '7' }),
      arrayElementFactory.build({ index: '18446744073709551610' }),
    ])

    expect(screen.getByTestId('array-details-table-index-0')).toHaveTextContent(
      '0',
    )
    expect(screen.getByTestId('array-details-table-index-7')).toHaveTextContent(
      '7',
    )
    expect(
      screen.getByTestId('array-details-table-index-18446744073709551610'),
    ).toHaveTextContent('18446744073709551610')
  })

  it('shows "(empty)" for null values (gap-preserving range)', () => {
    renderComponent([arrayElementFactory.build({ index: '3' })])

    expect(screen.getByTestId('array-details-table-empty-3')).toHaveTextContent(
      '(empty)',
    )
  })

  it('shows "(empty)" when value is undefined (JSON-dropped key edge case)', () => {
    renderComponent([
      arrayElementFactory.build({
        index: '4',
        value: undefined,
      } as unknown as Partial<ArrayDataElement>),
    ])

    expect(screen.getByTestId('array-details-table-empty-4')).toHaveTextContent(
      '(empty)',
    )
  })

  it('renders a value cell for populated rows', () => {
    renderComponent([arrayElementWithValueFactory.build({ index: '1' })])

    expect(
      screen.getByTestId('array-details-table-value-1'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('array-details-table-empty-1'),
    ).not.toBeInTheDocument()
  })

  it('smoke-renders without crashing when there are no elements', () => {
    const { container } = renderComponent([])
    expect(container).toBeTruthy()
  })

  it('shows the error message in the empty state when the fetch failed', () => {
    renderComponent([], false, 'Network unreachable')
    expect(screen.getByText('Network unreachable')).toBeInTheDocument()
  })

  it('prefers the loading message over the error while a retry is in flight', () => {
    renderComponent([], true, 'Network unreachable')
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByText('Network unreachable')).not.toBeInTheDocument()
  })

  it('falls back to the default empty message when error is an empty string', () => {
    // The array slice resets `error` to `''` after a successful request, so
    // a nullish-only fallback would leave the table blank on an empty range.
    renderComponent([], false, '')
    expect(screen.getByText('No elements in range')).toBeInTheDocument()
  })

  it('renders an expanded panel when a row is expanded via row click', async () => {
    const user = userEvent.setup()
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '7' })]}
        loading={false}
        expandRowOnClick
        getIsRowExpandable={() => true}
        renderExpandedRow={(row) => (
          <div data-testid={`expanded-${row.original.index}`}>panel</div>
        )}
      />,
    )

    await user.click(screen.getByTestId('array-details-table-index-7'))

    expect(await screen.findByTestId('expanded-7')).toBeInTheDocument()
  })

  it('renders no expand affordance when expansion props are omitted', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '7' })]}
        loading={false}
      />,
    )
    expect(screen.queryByTestId('expanded-7')).not.toBeInTheDocument()
  })

  const deleteConfig = {
    deleting: '',
    suffix: '-array-element',
    hideEmptySlots: true,
    closePopover: jest.fn(),
    showPopover: jest.fn(),
    handleDeleteElement: jest.fn(),
  }

  it('renders a per-row delete trigger when deleteConfig is provided', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '2' })]}
        loading={false}
        deleteConfig={deleteConfig}
      />,
    )

    expect(screen.getByTestId('array-remove-btn-2-icon')).toBeInTheDocument()
  })

  it('renders no actions column when deleteConfig is omitted', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '2' })]}
        loading={false}
      />,
    )

    expect(
      screen.queryByTestId('array-remove-btn-2-icon'),
    ).not.toBeInTheDocument()
  })

  const selectionConfig = {
    rowSelection: {},
    onRowSelectionChange: jest.fn(),
    getRowCanSelect: (element: ArrayDataElement) => element.value != null,
  }

  it('shows the header select-all when at least one row is selectable', () => {
    render(
      <ArrayDetailsTable
        elements={[
          arrayElementWithValueFactory.build({ index: '0' }),
          arrayElementFactory.build({ index: '1' }),
        ]}
        loading={false}
        selectionConfig={selectionConfig}
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: /all rows/i }),
    ).toBeInTheDocument()
  })

  it('hides the header select-all when no row is selectable (all-empty range)', () => {
    render(
      <ArrayDetailsTable
        elements={[
          arrayElementFactory.build({ index: '6' }),
          arrayElementFactory.build({ index: '7' }),
        ]}
        loading={false}
        selectionConfig={selectionConfig}
      />,
    )

    expect(
      screen.queryByRole('checkbox', { name: /all rows/i }),
    ).not.toBeInTheDocument()
  })
})
