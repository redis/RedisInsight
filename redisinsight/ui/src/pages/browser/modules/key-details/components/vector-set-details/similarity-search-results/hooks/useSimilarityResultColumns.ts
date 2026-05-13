import { useCallback, useMemo, useState } from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX } from '../constants'
import { SimilarityResultsColumn } from '../SimilaritySearchResultsTable.types'
import { buildSimilarityResultsColumns } from '../SimilaritySearchResultsTable.config'
import { collectAttributeKeys, parseAttributes } from '../utils/parseAttributes'

export interface UseSimilarityResultColumnsResult {
  columns: ColumnDef<VectorSetSimilarityMatch>[]
  columnVisibility: Record<string, boolean>
  /** Toggleable attribute columns only (Element + Similarity are always shown). */
  columnsMap: Map<string, string>
  shownColumns: string[]
  onShownColumnsChange: (next: string[]) => void
  attributeKeys: string[]
  /**
   * Per-match cache of the parsed `attributes` JSON. Populated once per
   * match so each row pays the JSON-parse cost a single time regardless
   * of how many attribute columns it renders.
   */
  parsedAttributesCache: WeakMap<
    VectorSetSimilarityMatch,
    Record<string, unknown>
  >
}

/** `foo` → `attr_foo`. */
export const attributeColumnId = (key: string): string =>
  `${SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX}${key}`

/**
 * Column-visibility state for the similarity-search results table.
 *
 * Tracks *hidden* ids (not shown) so new attribute keys default to visible
 * while previously-hidden ones stay hidden across re-searches. Element +
 * Similarity are always visible and excluded from `columnsMap`.
 */
export const useSimilarityResultColumns = (
  matches: VectorSetSimilarityMatch[],
): UseSimilarityResultColumnsResult => {
  const attributeKeys = useMemo(() => collectAttributeKeys(matches), [matches])

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(),
  )

  const columns = useMemo(
    () => buildSimilarityResultsColumns(attributeKeys),
    [attributeKeys],
  )

  const columnsMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const key of attributeKeys) {
      map.set(attributeColumnId(key), key)
    }
    return map
  }, [attributeKeys])

  const shownColumns = useMemo(
    () => [
      SimilarityResultsColumn.Name,
      SimilarityResultsColumn.Similarity,
      ...Array.from(columnsMap.keys()).filter((id) => !hiddenColumns.has(id)),
    ],
    [columnsMap, hiddenColumns],
  )

  const onShownColumnsChange = useCallback(
    (next: string[]) => {
      const nextShown = new Set(next)
      const nextHidden = new Set<string>()
      for (const id of columnsMap.keys()) {
        if (!nextShown.has(id)) nextHidden.add(id)
      }
      setHiddenColumns(nextHidden)
    },
    [columnsMap],
  )

  const columnVisibility = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {}
    for (const id of hiddenColumns) out[id] = false
    return out
  }, [hiddenColumns])

  const parsedAttributesCache = useMemo(() => {
    const cache = new WeakMap<
      VectorSetSimilarityMatch,
      Record<string, unknown>
    >()
    for (const match of matches) {
      cache.set(match, parseAttributes(match.attributes))
    }
    return cache
  }, [matches])

  return {
    columns,
    columnVisibility,
    columnsMap,
    shownColumns,
    onShownColumnsChange,
    attributeKeys,
    parsedAttributesCache,
  }
}
