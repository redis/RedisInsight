import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { vectorSetSimilarityMatchFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'

import { SimilaritySearchResultsTable } from './SimilaritySearchResultsTable'
import { buildSimilarityResultsColumns } from './SimilaritySearchResultsTable.config'
import {
  buildParsedAttributesCache,
  collectAttributeKeys,
} from './utils/parseAttributes'

const buildMatch = (
  name: string,
  score: number,
  attributes?: string,
): VectorSetSimilarityMatch =>
  vectorSetSimilarityMatchFactory.build({
    name: stringToBuffer(name),
    score,
    attributes,
  })

/**
 * Build the table props the same way `VectorSetDetails` does in production —
 * keeps the spec realistic and means a single change to the column-builder
 * signature surfaces here too.
 */
const renderTable = (matches: VectorSetSimilarityMatch[]) => {
  const parsedAttributesCache = buildParsedAttributesCache(matches)
  const attributeKeys = collectAttributeKeys(matches, parsedAttributesCache)
  const columns = buildSimilarityResultsColumns(attributeKeys)
  return render(
    <SimilaritySearchResultsTable
      matches={matches}
      columns={columns}
      parsedAttributesCache={parsedAttributesCache}
    />,
  )
}

describe('SimilaritySearchResultsTable', () => {
  it('renders the empty state when no matches are provided', () => {
    renderTable([])

    expect(
      screen.getByTestId('vector-set-similarity-results'),
    ).toBeInTheDocument()
    expect(screen.getByText('No matching elements found.')).toBeInTheDocument()
  })

  it('renders one row per match with Element + Similarity columns', () => {
    const matches = [buildMatch('alpha', 0.9999), buildMatch('beta', 0.5)]

    const { container } = renderTable(matches)

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

    renderTable(matches)

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

    renderTable(matches)

    const cells = screen.getAllByTestId(/vector-set-similarity-cell-/)
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '95.00 %',
      '50.00 %',
      '10.00 %',
    ])
  })

  it('falls back to a dash for non-finite scores', () => {
    renderTable([buildMatch('broken', Number.NaN)])

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('marks scores >= the high-similarity threshold with the success variant', () => {
    const matches = [
      buildMatch('high', 0.86),
      buildMatch('boundary', 0.85),
      buildMatch('low', 0.84),
    ]

    renderTable(matches)

    // Sorted desc by score → high (0.86), boundary (0.85), low (0.84). Cells
    // above the threshold get a different styled-component class than ones
    // below it — that's a stable proxy for "different visual treatment"
    // without coupling to the literal hex value.
    const cells = screen.getAllByTestId(/vector-set-similarity-cell-/)
    expect(cells[0].className).toBe(cells[1].className)
    expect(cells[0].className).not.toBe(cells[2].className)
  })

  describe('attribute columns', () => {
    it('renders one column per attribute key, alphabetically', () => {
      const matches = [
        buildMatch('a', 0.9, '{"zeta":1,"alpha":"x"}'),
        buildMatch('b', 0.8, '{"beta":2}'),
      ]

      renderTable(matches)

      // Header order: Element, Similarity, then attributes alphabetically.
      const headers = screen
        .getAllByRole('columnheader')
        .map((h) => h.textContent?.trim())
      expect(headers).toEqual([
        'Element',
        'Similarity',
        'alpha',
        'beta',
        'zeta',
      ])
    })

    it('renders attribute values per row', () => {
      const matches = [
        buildMatch('a', 0.9, '{"city":"NYC","count":3}'),
        buildMatch('b', 0.8, '{"city":"LA"}'),
      ]

      renderTable(matches)

      // a is first (higher score), so row 0 = a, row 1 = b.
      expect(
        screen.getByTestId('vector-set-similarity-attribute-cell-0-city'),
      ).toHaveTextContent('NYC')
      expect(
        screen.getByTestId('vector-set-similarity-attribute-cell-0-count'),
      ).toHaveTextContent('3')
      expect(
        screen.getByTestId('vector-set-similarity-attribute-cell-1-city'),
      ).toHaveTextContent('LA')
      // b has no `count` attribute → empty cell
      expect(
        screen.getByTestId('vector-set-similarity-attribute-cell-1-count'),
      ).toHaveTextContent('')
    })
  })
})
