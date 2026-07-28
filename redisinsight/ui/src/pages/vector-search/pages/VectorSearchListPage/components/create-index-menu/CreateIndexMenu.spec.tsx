import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'

import { isVectorSearchEnhancementsEnabledSelector } from 'uiSrc/slices/app/features'
import { useVectorSearch } from '../../../../context/vector-search'
import { CreateIndexMenu } from './CreateIndexMenu'

jest.mock('../../../../context/vector-search', () => ({
  useVectorSearch: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  isVectorSearchEnhancementsEnabledSelector: jest.fn(() => true),
}))

const mockUseVectorSearch = jest.mocked(useVectorSearch)
const mockEnhancementsEnabled = jest.mocked(
  isVectorSearchEnhancementsEnabledSelector,
)

const renderComponent = (
  vectorSearch: Partial<ReturnType<typeof useVectorSearch>> = {},
) => {
  mockUseVectorSearch.mockReturnValue({
    openPickSampleDataModal: jest.fn(),
    navigateToExistingDataFlow: jest.fn(),
    ...vectorSearch,
  } as unknown as ReturnType<typeof useVectorSearch>)

  return render(<CreateIndexMenu />)
}

describe('CreateIndexMenu', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockEnhancementsEnabled.mockReturnValue(true)
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

  it('should call navigateToExistingDataFlow when "Use existing data" is clicked', async () => {
    renderComponent()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).not.toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(existingDataItem)

    expect(mockUseVectorSearch().navigateToExistingDataFlow).toHaveBeenCalled()
  })

  it('should disable "Use existing data" when the flag is off and the database has no keys', async () => {
    mockEnhancementsEnabled.mockReturnValue(false)
    renderComponent({ hasExistingKeys: false, hasExistingKeysLoading: false })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should keep "Use existing data" enabled when the flag is off but the keys probe failed', async () => {
    mockEnhancementsEnabled.mockReturnValue(false)
    renderComponent({
      hasExistingKeys: false,
      hasExistingKeysLoading: false,
      hasExistingKeysError: true,
    })

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    await userEvent.click(btn)

    const existingDataItem = screen.getByTestId(
      'vector-search--list--create-index--existing-data',
    )
    expect(existingDataItem).not.toHaveAttribute('aria-disabled', 'true')
  })
})
