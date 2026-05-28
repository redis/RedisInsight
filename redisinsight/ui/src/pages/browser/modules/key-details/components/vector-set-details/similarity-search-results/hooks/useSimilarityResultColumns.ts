import { useCallback, useMemo, useState } from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX } from '../constants'
import {
  ParsedAttributesCache,
  SimilarityResultsColumn,
} from '../SimilaritySearchResultsTable.types'
import { buildSimilarityResultsColumns } from '../SimilaritySearchResultsTable.config'
import {
  buildParsedAttributesCache,
  collectAttributeKeys,
} from '../utils/parseAttributes'

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
  parsedAttributesCache: ParsedAttributesCache
}

/** `foo` → `attr_foo`. */
export const attributeColumnId = (key: string): string =>
  `${SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX}${key}`

/**
 * Column-visibility state for the similarity-search results table.
 *
 * Tracks *explicitly shown* attribute ids so attribute columns default to
 * hidden — the user opts them in via the Columns popover, and that decision
 * is preserved when new searches surface new attribute keys. Element +
 * Similarity are always visible and excluded from `columnsMap`.
 */
export const useSimilarityResultColumns = (
  matches: VectorSetSimilarityMatch[],
): UseSimilarityResultColumnsResult => {
  const parsedAttributesCache = useMemo<ParsedAttributesCache>(
    () => buildParsedAttributesCache(matches),
    [matches],
  )

  const attributeKeys = useMemo(
    () => collectAttributeKeys(matches, parsedAttributesCache),
    [matches, parsedAttributesCache],
  )

  const [shownAttributeColumns, setShownAttributeColumns] = useState<
    Set<string>
  >(() => new Set())

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
      SimilarityResultsColumn.Rank,
      SimilarityResultsColumn.Similarity,
      ...Array.from(columnsMap.keys()).filter((id) =>
        shownAttributeColumns.has(id),
      ),
    ],
    [columnsMap, shownAttributeColumns],
  )

  const onShownColumnsChange = useCallback(
    (next: string[]) => {
      const nextSet = new Set(next)
      const nextShownAttrs = new Set<string>()
      for (const id of columnsMap.keys()) {
        if (nextSet.has(id)) nextShownAttrs.add(id)
      }
      setShownAttributeColumns(nextShownAttrs)
    },
    [columnsMap],
  )

  const columnVisibility = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {}
    for (const id of columnsMap.keys()) {
      if (!shownAttributeColumns.has(id)) out[id] = false
    }
    return out
  }, [columnsMap, shownAttributeColumns])

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
