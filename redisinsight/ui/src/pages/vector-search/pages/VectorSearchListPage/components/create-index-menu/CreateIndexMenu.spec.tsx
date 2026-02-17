import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'

import { CreateIndexMenu } from './CreateIndexMenu'

const mockOpenPickSampleDataModal = jest.fn()

jest.mock('../../../../context/vector-search', () => ({
  useVectorSearch: jest.fn(() => ({
    openPickSampleDataModal: mockOpenPickSampleDataModal,
  })),
}))

const renderComponent = () => render(<CreateIndexMenu />)

describe('CreateIndexMenu', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the create index button', () => {
    renderComponent()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    expect(btn).toBeInTheDocument()
    expect(screen.getByText('+ Create search index')).toBeInTheDocument()
  })

  it('should open the menu and show options when button is clicked', async () => {
    renderComponent()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const sampleDataItem = screen.getByTestId(
      'vector-search--list--create-index--sample-data',
    )
    expect(sampleDataItem).toBeInTheDocument()

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).toBeInTheDocument()
  })

  it('should call openPickSampleDataModal when "Use sample data" is clicked', async () => {
    renderComponent()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const sampleDataItem = screen.getByTestId(
      'vector-search--list--create-index--sample-data',
    )
    await userEvent.click(sampleDataItem)

    expect(mockOpenPickSampleDataModal).toHaveBeenCalled()
  })

  it('should have "Use existing data" option disabled', async () => {
    renderComponent()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).toHaveAttribute('aria-disabled', 'true')
  })
})
