import React from 'react'
import { faker } from '@faker-js/faker'

import { render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { SimilaritySearchResultsTable } from './SimilaritySearchResultsTable'

faker.seed(8158)

const buildMatch = (name: string, score: number): VectorSetSimilarityMatch => ({
  name: stringToBuffer(name),
  score,
})

describe('SimilaritySearchResultsTable', () => {
  it('renders the empty state when no matches are provided', () => {
    render(<SimilaritySearchResultsTable matches={[]} />)

    expect(
      screen.getByTestId('vector-set-similarity-results'),
    ).toBeInTheDocument()
    expect(screen.getByText('No matching elements found.')).toBeInTheDocument()
  })

  it('renders one row per match with Element + Similarity columns', () => {
    const matches = [buildMatch('alpha', 0.9999), buildMatch('beta', 0.5)]

    const { container } = render(
      <SimilaritySearchResultsTable matches={matches} />,
    )

    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(screen.getByText('Element')).toBeInTheDocument()
    expect(screen.getByText('Similarity')).toBeInTheDocument()
  })

  it('formats scores as fixed-2-precision percentages', () => {
    const matches = [
      buildMatch('alpha', 0.9999),
      buildMatch('beta', 0.5),
      buildMatch('gamma', 0),
    ]

    render(<SimilaritySearchResultsTable matches={matches} />)

    expect(screen.getByText('99.99 %')).toBeInTheDocument()
    expect(screen.getByText('50.00 %')).toBeInTheDocument()
    expect(screen.getByText('0.00 %')).toBeInTheDocument()
  })

  it('orders matches by score descending', () => {
    const matches = [
      buildMatch('low', 0.1),
      buildMatch('high', 0.95),
      buildMatch('mid', 0.5),
    ]

    render(<SimilaritySearchResultsTable matches={matches} />)

    const cells = screen.getAllByTestId(/vector-set-similarity-cell-/)
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '95.00 %',
      '50.00 %',
      '10.00 %',
    ])
  })

  it('falls back to a dash for non-finite scores', () => {
    const matches = [buildMatch('broken', Number.NaN)]

    render(<SimilaritySearchResultsTable matches={matches} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('marks scores >= the high-similarity threshold with the success variant', () => {
    const matches = [
      buildMatch('high', 0.86),
      buildMatch('boundary', 0.85),
      buildMatch('low', 0.84),
    ]

    render(<SimilaritySearchResultsTable matches={matches} />)

    // Sorted desc by score → high (0.86), boundary (0.85), low (0.84). Cells
    // above the threshold get a different styled-component class than ones
    // below it — that's a stable proxy for "different visual treatment"
    // without coupling to the literal hex value.
    const cells = screen.getAllByTestId(/vector-set-similarity-cell-/)
    expect(cells[0].className).toBe(cells[1].className)
    expect(cells[0].className).not.toBe(cells[2].className)
  })
})
