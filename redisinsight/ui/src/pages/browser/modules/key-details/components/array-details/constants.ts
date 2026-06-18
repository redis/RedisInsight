/**
 * Defaults for the array View / Browse vertical (see
 * `docs/redis-array-type-initiative.md` §6 Task 3). All indexes are decimal
 * strings to preserve the BigInt-as-string contract (§8.1) — never numbers.
 */

/** Inclusive lower bound for the initial range query. */
export const DEFAULT_RANGE_START = '0'

/**
 * Inclusive upper bound for the initial range query. ARGETRANGE is hard-
 * capped at 1,000,000 elements server-side; 9 gives a 10-element preview
 * so the table comfortably fits without scrolling on first load.
 */
export const DEFAULT_RANGE_END = '9'

export enum ArrayDetailsTab {
  View = 'view',
  Aggregate = 'aggregate',
  Search = 'search',
}

export const DEFAULT_ARRAY_DETAILS_TAB = ArrayDetailsTab.View

export const ARRAY_DETAILS_TAB_LABELS: Record<ArrayDetailsTab, string> = {
  [ArrayDetailsTab.View]: 'View',
  [ArrayDetailsTab.Aggregate]: 'Aggregate',
  [ArrayDetailsTab.Search]: 'Search',
}
