import React from 'react'
import { act } from '@testing-library/react'
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'

import { useVectorSearch } from '../../../../context/vector-search'
import { CreateIndexMenu } from './CreateIndexMenu'

jest.mock('../../../../context/vector-search', () => ({
  useVectorSearch: jest.fn(),
}))

const mockUseVectorSearch = jest.mocked(useVectorSearch)

const renderComponent = ({
  hasExistingKeys = false,
  hasExistingKeysLoading = false,
} = {}) => {
  mockUseVectorSearch.mockReturnValue({
    hasExistingKeys,
    hasExistingKeysLoading,
    openPickSampleDataModal: jest.fn(),
    navigateToExistingDataFlow: jest.fn(),
  } as unknown as ReturnType<typeof useVectorSearch>)

  return render(<CreateIndexMenu />)
}

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

    expect(mockUseVectorSearch().openPickSampleDataModal).toHaveBeenCalled()
  })

  it('should have "Use existing data" option disabled when no keys exist', async () => {
    renderComponent({ hasExistingKeys: false })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show tooltip when no keys exist', async () => {
    renderComponent({ hasExistingKeys: false })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )

    await act(async () => {
      fireEvent.focus(existingDataItem)
    })
    await waitForRiTooltipVisible()

    expect(
      screen.getAllByText('No Hash or JSON keys found in your database')[0],
    ).toBeInTheDocument()
  })

  it('should show loading tooltip when keys are being checked', async () => {
    renderComponent({ hasExistingKeysLoading: true })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )

    await act(async () => {
      fireEvent.focus(existingDataItem)
    })
    await waitForRiTooltipVisible()

    expect(
      screen.getAllByText('Checking for existing keys…')[0],
    ).toBeInTheDocument()
  })

  it('should enable "Use existing data" when keys exist', async () => {
    renderComponent({ hasExistingKeys: true })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).not.toHaveAttribute('aria-disabled', 'true')
  })
})
