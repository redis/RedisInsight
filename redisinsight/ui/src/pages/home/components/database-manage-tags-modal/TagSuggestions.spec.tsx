import React from 'react'
import { useSelector } from 'react-redux'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { Tag } from 'uiSrc/slices/interfaces/tag'
import { TagSuggestions, TagSuggestionsProps } from './TagSuggestions'
import { presetTagSuggestions } from './constants'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  connect: () => (Component: any) => Component,
}))

const mockSelector = useSelector as jest.MockedFunction<typeof useSelector>

const mockTags: Tag[] = [
  {
    id: '1',
    key: 'env',
    value: 'prod',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'version',
    value: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('TagSuggestions', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockSelector.mockReturnValue({
      data: mockTags,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (props: Partial<TagSuggestionsProps> = {}) => {
    const defaultProps: TagSuggestionsProps = {
      searchTerm: '',
      currentTagKeys: new Set(),
      onChange: mockOnChange,
      ...props,
    }
    return render(<TagSuggestions {...defaultProps} />)
  }

  it('should render TagSuggestions component', () => {
    renderComponent()
    expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
  })

  it('should call onChange when a tag key is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByText('env'))

    expect(mockOnChange).toHaveBeenCalledWith('env')
  })

  it('should call onChange when a tag value is clicked', () => {
    renderComponent({
      targetKey: 'env',
    })
    fireEvent.click(screen.getByText('prod'))

    expect(mockOnChange).toHaveBeenCalledWith('prod')
  })

  it('should display the correct number of tags', () => {
    renderComponent()
    const tagElements = screen.getAllByRole('listitem')

    expect(tagElements.length).toBe(7)
  })

  it('should display no preset + local tags, without duplicates', () => {
    mockSelector.mockReturnValue({
      data: [...mockTags, presetTagSuggestions[0]],
    })

    renderComponent()
    const tagElements = screen.getAllByRole('listitem')

    expect(tagElements.length).toBe(7)
  })

  it('should display correct number of value suggestions when duplicated tag keys are present', () => {
    mockSelector.mockReturnValue({
      data: presetTagSuggestions,
    })

    renderComponent({
      targetKey: 'environment',
    })
    const tagElements = screen.getAllByRole('listitem')

    expect(tagElements.length).toBe(3)
  })
})
