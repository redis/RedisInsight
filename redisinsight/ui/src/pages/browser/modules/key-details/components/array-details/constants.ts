/**
 * Defaults for the array View / Browse vertical. All indexes are decimal
 * strings, never numbers, to preserve the full u64 range.
 */

import {
  ArrayCombinator,
  ArrayGrepCriteria,
  ArraySearchOptions,
} from 'uiSrc/slices/interfaces/array'

/** Inclusive lower bound for the initial range query. */
export const DEFAULT_RANGE_START = '0'

/**
 * Inclusive upper bound for the initial range query. ARGETRANGE is hard-
 * capped at 1,000,000 elements server-side; 9 gives a 10-element preview
 * so the table comfortably fits without scrolling on first load.
 */
export const DEFAULT_RANGE_END = '9'

/**
 * Size of the window the View jumps to when revealing a just-added element
 * that fell outside the current range (matches the 10-element default span).
 */
export const REVEAL_WINDOW_SIZE = 10

/** Criteria pre-selected for a new predicate row on the Search tab. */
export const DEFAULT_SEARCH_CRITERIA = ArrayGrepCriteria.Exact

/**
 * Global connective pre-selected on the Search tab. `OR` mirrors the server's
 * own default, so the toggle starts where the backend would land anyway.
 */
export const DEFAULT_SEARCH_COMBINATOR = ArrayCombinator.Or

/** Pre-filled LIMIT value, applied only once the user enables LIMIT. */
export const DEFAULT_LIMIT = '10'

/** Initial Search-tab option state. */
export const DEFAULT_SEARCH_OPTIONS: ArraySearchOptions = {
  start: '',
  end: '',
  nocase: false,
  withValues: true,
  limitEnabled: false,
  limit: DEFAULT_LIMIT,
}

export enum ArrayDetailsTab {
  View = 'view',
  Search = 'search',
  Aggregate = 'aggregate',
}

export const DEFAULT_ARRAY_DETAILS_TAB = ArrayDetailsTab.View

export const ARRAY_DETAILS_TAB_LABELS: Record<ArrayDetailsTab, string> = {
  [ArrayDetailsTab.View]: 'View',
  [ArrayDetailsTab.Search]: 'Search',
  [ArrayDetailsTab.Aggregate]: 'Aggregate',
}

/**
 * Context is opt-in: rows aren't expandable until the user enables it, so the
 * neighbour band never fetches for a match the user didn't ask to expand.
 */
export const DEFAULT_CONTEXT_ENABLED = false
/** Default ± neighbours shown when a search match is expanded. */
export const DEFAULT_CONTEXT_COUNT = 2
export const CONTEXT_COUNT_MIN = 0
/** Upper bound on the context window so an expand can't request a huge range. */
export const CONTEXT_COUNT_MAX = 50

/** Seed/reset value for the Search tab's Context option. */
export const DEFAULT_CONTEXT = {
  enabled: DEFAULT_CONTEXT_ENABLED,
  count: DEFAULT_CONTEXT_COUNT,
}

/**
 * Max indexes a single bulk delete can send, mirroring the backend
 * `DeleteArrayElementsDto` cap (`ARRAY_RANGE_MAX_ELEMENTS`). An unbounded
 * Search can select more than this, so fail fast with a clear message instead
 * of a raw validation error.
 */
export const ARRAY_BULK_DELETE_MAX = 1_000_000
