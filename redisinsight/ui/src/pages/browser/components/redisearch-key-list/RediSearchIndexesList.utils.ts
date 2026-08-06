import { formatLongName } from 'uiSrc/utils'
import { getIndexDisplayName } from 'uiSrc/pages/vector-search/utils'

const MAX_LABEL_LENGTH = 100
const LABEL_END_PART_LENGTH = 10

// Characters reserved for option padding and the selection indicator
const OPTION_CHROME_CH = 6

export const getIndexOptionLabel = (indexName: string) =>
  formatLongName(
    getIndexDisplayName(indexName),
    MAX_LABEL_LENGTH,
    LABEL_END_PART_LENGTH,
  )

/**
 * Matches an index against a drop-down search term by both its name and its displayed
 * label, so an index whose label differs from its name — an unnamed index renders as
 * "(empty name)" — stays reachable.
 */
export const matchesIndexSearch = (indexName: string, search: string) => {
  const term = search.trim().toLowerCase()
  if (!term) return true

  return (
    indexName.toLowerCase().includes(term) ||
    getIndexOptionLabel(indexName).toLowerCase().includes(term)
  )
}

/**
 * Width for the index drop-down, derived from the longest label in the whole list so
 * that filtering the options never resizes the popover. `ch` approximates the label
 * width; the popover floor stays the trigger width.
 */
export const getIndexOptionsWidth = (indexNames: string[]) => {
  const longestLabel = Math.max(
    0,
    ...indexNames.map((name) => getIndexOptionLabel(name).length),
  )

  return `max(var(--radix-select-trigger-width), ${longestLabel + OPTION_CHROME_CH}ch)`
}
