import { act, renderHook } from '@testing-library/react'

import { stringToBuffer } from 'uiSrc/utils'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { vectorSetSimilarityMatchFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'

import {
  attributeColumnId,
  useSimilarityResultColumns,
} from './useSimilarityResultColumns'
import { SimilarityResultsColumn } from '../SimilaritySearchResultsTable.types'

/** Positional shorthand around the shared factory — tests here always care
 *  about a specific name + score, so the factory's random defaults add noise. */
const match = (
  name: string,
  score: number,
  attributes?: string,
): VectorSetSimilarityMatch =>
  vectorSetSimilarityMatchFactory.build({
    name: stringToBuffer(name),
    score,
    attributes,
  })

describe('useSimilarityResultColumns', () => {
  it('returns static columns + alphabetical attribute columns', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([
        match('a', 0.9, '{"zeta":1,"alpha":2}'),
        match('b', 0.8, '{"beta":3}'),
      ]),
    )

    const ids = result.current.columns.map((c) => c.id)
    expect(ids).toEqual([
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      attributeColumnId('alpha'),
      attributeColumnId('beta'),
      attributeColumnId('zeta'),
    ])
    expect(result.current.attributeKeys).toEqual(['alpha', 'beta', 'zeta'])
  })

  it('builds a columnsMap that only contains toggleable attribute columns', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9, '{"foo":1}')]),
    )

    // Element + Similarity are intentionally absent so the popover never
    // offers a way to hide them.
    expect(Array.from(result.current.columnsMap.entries())).toEqual([
      [attributeColumnId('foo'), 'foo'],
    ])
  })

  it('returns an empty columnsMap when matches have no attributes', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9), match('b', 0.8)]),
    )

    expect(result.current.columnsMap.size).toBe(0)
  })

  it('keeps Element + Similarity anchored in shownColumns alongside visible attribute keys', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9, '{"foo":1}')]),
    )

    expect(result.current.shownColumns).toEqual([
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      attributeColumnId('foo'),
    ])
    expect(result.current.columnVisibility).toEqual({})
  })

  it('hides columns when onShownColumnsChange omits them', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9, '{"foo":1,"bar":2}')]),
    )

    act(() => {
      result.current.onShownColumnsChange([
        SimilarityResultsColumn.Name,
        SimilarityResultsColumn.Similarity,
        attributeColumnId('bar'),
      ])
    })

    expect(result.current.shownColumns).toEqual([
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      attributeColumnId('bar'),
    ])
    expect(result.current.columnVisibility).toEqual({
      [attributeColumnId('foo')]: false,
    })
  })

  it('keeps Element + Similarity visible even if onShownColumnsChange forgets them', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9, '{"foo":1}')]),
    )

    // Simulate a buggy/legacy caller that passes only attribute ids.
    act(() => {
      result.current.onShownColumnsChange([attributeColumnId('foo')])
    })

    expect(result.current.shownColumns).toEqual([
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      attributeColumnId('foo'),
    ])
    expect(result.current.columnVisibility).toEqual({})
  })

  it('preserves hidden state when new matches surface new attribute keys', () => {
    const initial = [match('a', 0.9, '{"foo":1}')]
    const { result, rerender } = renderHook(
      (matches: VectorSetSimilarityMatch[]) =>
        useSimilarityResultColumns(matches),
      { initialProps: initial },
    )

    act(() => {
      result.current.onShownColumnsChange([
        SimilarityResultsColumn.Name,
        SimilarityResultsColumn.Similarity,
      ])
    })
    expect(result.current.columnVisibility).toEqual({
      [attributeColumnId('foo')]: false,
    })

    // New search introduces a `bar` attribute → it should default to visible
    // while the user's existing decision to hide `foo` is preserved.
    rerender([match('c', 0.7, '{"foo":1,"bar":2}')])
    expect(result.current.shownColumns).toEqual([
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      attributeColumnId('bar'),
    ])
    expect(result.current.columnVisibility).toEqual({
      [attributeColumnId('foo')]: false,
    })
  })

  it('populates the parsed-attributes cache up front', () => {
    const a = match('a', 0.9, '{"foo":1}')
    const b = match('b', 0.8, '{"bar":"x"}')
    const { result } = renderHook(() => useSimilarityResultColumns([a, b]))

    expect(result.current.parsedAttributesCache.get(a)).toEqual({ foo: 1 })
    expect(result.current.parsedAttributesCache.get(b)).toEqual({ bar: 'x' })
  })

  it('returns no attribute columns when matches have no attributes', () => {
    const { result } = renderHook(() =>
      useSimilarityResultColumns([match('a', 0.9), match('b', 0.8)]),
    )

    expect(result.current.attributeKeys).toEqual([])
    expect(result.current.columns).toHaveLength(2)
  })
})
