/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import { SavedQueriesScreen } from './SavedQueriesScreen'
import { SavedIndex } from './types'

const mockOnIndexChange = jest.fn()
const mockOnQueryInsert = jest.fn()

const mockSavedIndexes: SavedIndex[] = [
  {
    value: 'bicycle_index',
    tags: ['tag', 'text', 'vector'],
    queries: [
      {
        label: 'Search for bikes',
        value: 'FT.SEARCH idx:bike "@category:mountain"',
      },
      {
        label: 'Find road bikes',
        value: 'FT.SEARCH idx:bike "@type:road"',
      },
    ],
  },
  {
    value: 'restaurant_index',
    tags: ['text', 'vector'],
    queries: [
      {
        label: 'Search for restaurants',
        value: 'FT.SEARCH idx:restaurant "@cuisine:Italian"',
      },
    ],
  },
]

const defaultProps = {
  savedIndexes: mockSavedIndexes,
  selectedIndex: mockSavedIndexes[0],
  onIndexChange: mockOnIndexChange,
  onQueryInsert: mockOnQueryInsert,
}

describe('SavedQueriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<SavedQueriesScreen {...defaultProps} />)).toBeTruthy()
  })

  it('should render the main content', () => {
    render(<SavedQueriesScreen {...defaultProps} />)

    expect(screen.getByText('Saved queries')).toBeInTheDocument()
    expect(screen.getByText('Index:')).toBeInTheDocument()

    // Check that all queries from the selected index are rendered
    expect(screen.getByText('Search for bikes')).toBeInTheDocument()
    expect(screen.getByText('Find road bikes')).toBeInTheDocument()
  })

  it('should render insert buttons for each query', () => {
    render(<SavedQueriesScreen {...defaultProps} />)

    const insertButtons = screen.getAllByText('Insert')
    expect(insertButtons).toHaveLength(2) // 2 queries in the selected index
  })

  it('should call onQueryInsert when insert button is clicked', () => {
    render(<SavedQueriesScreen {...defaultProps} />)

    const firstInsertButton = screen.getAllByText('Insert')[0]
    fireEvent.click(firstInsertButton)

    expect(mockOnQueryInsert).toHaveBeenCalledTimes(1)
    expect(mockOnQueryInsert).toHaveBeenCalledWith(
      'FT.SEARCH idx:bike "@category:mountain"',
    )
  })

  it('should call onQueryInsert with correct query value for second button', () => {
    render(<SavedQueriesScreen {...defaultProps} />)

    const insertButtons = screen.getAllByText('Insert')

    // Click second insert button
    fireEvent.click(insertButtons[1])
    expect(mockOnQueryInsert).toHaveBeenCalledWith(
      'FT.SEARCH idx:bike "@type:road"',
    )
  })

  it('should render field tags for the selected index', () => {
    render(<SavedQueriesScreen {...defaultProps} />)

    // The tags should be rendered
    defaultProps.selectedIndex.tags
      .map((tag) => tag.toUpperCase())
      .forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
  })

  describe('with different selected index', () => {
    it('should render queries for restaurant index when selected', () => {
      const propsWithRestaurantIndex = {
        ...defaultProps,
        selectedIndex: mockSavedIndexes[1], // restaurant_index
      }

      render(<SavedQueriesScreen {...propsWithRestaurantIndex} />)

      expect(screen.getByText('Search for restaurants')).toBeInTheDocument()

      const insertButtons = screen.getAllByText('Insert')
      expect(insertButtons).toHaveLength(1) // 1 query in restaurant index
    })

    it('should call onQueryInsert with restaurant query values', () => {
      const propsWithRestaurantIndex = {
        ...defaultProps,
        selectedIndex: mockSavedIndexes[1], // restaurant_index
      }

      render(<SavedQueriesScreen {...propsWithRestaurantIndex} />)

      const insertButtons = screen.getAllByText('Insert')

      fireEvent.click(insertButtons[0])
      expect(mockOnQueryInsert).toHaveBeenCalledWith(
        'FT.SEARCH idx:restaurant "@cuisine:Italian"',
      )
    })
  })

  describe('with empty queries', () => {
    it('should handle index with no queries', () => {
      const indexWithNoQueries: SavedIndex = {
        value: 'empty_index',
        tags: ['text'],
        queries: [],
      }

      const propsWithEmptyQueries = {
        ...defaultProps,
        savedIndexes: [indexWithNoQueries],
        selectedIndex: indexWithNoQueries,
      }

      render(<SavedQueriesScreen {...propsWithEmptyQueries} />)

      expect(screen.queryByText('Insert')).not.toBeInTheDocument()
    })
  })
})
