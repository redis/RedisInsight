/**
 * Defaults for the array View / Browse vertical (see
 * `docs/redis-array-type-initiative.md` §6 Task 3). All indexes are decimal
 * strings to preserve the BigInt-as-string contract (§8.1) — never numbers.
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

/** Criteria pre-selected for a new predicate row on the Search tab. */
export const DEFAULT_SEARCH_CRITERIA = ArrayGrepCriteria.Exact

/**
 * Global connective pre-selected on the Search tab. `OR` mirrors the server's
 * own default, so the toggle starts where the backend would land anyway.
 */
export const DEFAULT_SEARCH_COMBINATOR = ArrayCombinator.Or

/**
 * Pre-filled LIMIT value. The input stays visible (but disabled) until the
 * user ticks LIMIT, so it shows a sensible starting count and ticking the box
 * doesn't shift the layout. Only applied once enabled — otherwise no LIMIT is
 * sent and the search runs uncapped.
 */
export const DEFAULT_LIMIT = '10'

/**
 * Initial Search-tab options. Blank bounds search the whole array; WITHVALUES
 * is on so results carry values; LIMIT is pre-filled but only applied once the
 * user enables it.
 */
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
