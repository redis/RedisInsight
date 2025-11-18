import React from 'react'
import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { rdiInstanceFactory } from 'uiSrc/mocks/rdi/RdiInstance.factory'
import BulkItemsActions from './BulkItemsActions'
import { handleDeleteInstances } from './methods/handlers'

jest.mock('./methods/handlers', () => ({
  handleDeleteInstances: jest.fn(),
}))

describe('BulkItemsActions', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render nothing when no items selected', () => {
    const { container } = render(
      <BulkItemsActions items={[]} onClose={jest.fn()} />,
    )

    // No delete button should be present
    expect(screen.queryByTestId('delete-btn')).toBeNull()
    // Container should be essentially empty
    expect(container.children.length).toBe(0)
  })

  it('should call handleDeleteInstances and onClose on confirm', async () => {
    const items = rdiInstanceFactory.buildList(2)
    const onClose = jest.fn()

    render(<BulkItemsActions items={items} onClose={onClose} />)

    // Open delete popover
    fireEvent.click(screen.getByTestId('delete-btn'))

    // Confirm delete in the popover
    const confirmBtn = await screen.findByTestId('delete-selected-dbs')
    fireEvent.click(confirmBtn)

    expect(handleDeleteInstances).toHaveBeenCalledTimes(1)
    expect(handleDeleteInstances).toHaveBeenCalledWith(items)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
