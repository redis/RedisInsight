import React from 'react'
import { render, screen, userEvent, within } from 'uiSrc/utils/test-utils'
import { ActionsCell } from './ActionsCell'
import { ActionsCellProps, IndexListRow } from '../../IndexesList.types'

const mockRow = {
  id: 'idx-products',
  name: 'products-idx',
} as IndexListRow

const renderComponent = (props: Partial<Omit<ActionsCellProps, 'row'>> = {}) =>
  render(<ActionsCell row={mockRow} {...props} />)

describe('ActionsCell', () => {
  it('renders the actions container', () => {
    renderComponent()
    expect(screen.getByTestId('index-actions-idx-products')).toBeInTheDocument()
  })

  it('renders Query button when onQueryClick is provided', () => {
    renderComponent({ onQueryClick: () => {} })
    expect(
      screen.getByTestId('index-query-btn-idx-products'),
    ).toBeInTheDocument()
  })

  it('calls onQueryClick with index name when Query is clicked', async () => {
    const onQueryClick = jest.fn()
    renderComponent({ onQueryClick })
    await userEvent.click(screen.getByTestId('index-query-btn-idx-products'))
    expect(onQueryClick).toHaveBeenCalledWith('products-idx')
  })

  it('calls action callback with index name when menu item is clicked', async () => {
    const onEdit = jest.fn()
    renderComponent({
      actions: [{ name: 'Edit', callback: onEdit }],
    })
    const actionsCell = screen.getByTestId('index-actions-idx-products')
    const [menuTrigger] = within(actionsCell).getAllByRole('button')
    await userEvent.click(menuTrigger)
    await userEvent.click(
      screen.getByTestId('index-actions-edit-btn-idx-products'),
    )
    expect(onEdit).toHaveBeenCalledWith('products-idx')
  })
})
