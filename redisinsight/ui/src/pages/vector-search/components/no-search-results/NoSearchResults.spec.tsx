import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { NoSearchResults } from './NoSearchResults'

describe('NoSearchResults', () => {
  it('should render correctly with default title', () => {
    render(<NoSearchResults />)

    expect(screen.getByTestId('no-search-results')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your query results will appear here once you run a query.',
      ),
    ).toBeInTheDocument()
  })
})
