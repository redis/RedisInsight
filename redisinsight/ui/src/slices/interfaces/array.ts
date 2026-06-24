import {
  AggregateArrayDto,
  AggregateArrayResponse,
  GetArrayCountResponse,
  GetArrayLengthResponse,
  GetArrayRangeResponse,
  GetArraySearchResponse,
  GetArrayScanResponse,
} from 'apiClient'
import { RedisString } from 'uiSrc/slices/interfaces/app'

/**
 * Mirror of the backend `ArrayAggregateOperation` enum (BE
 * `dto/aggregate.array.dto.ts`). Kept as a TS enum so the UI form / select
 * can reference named members instead of bare strings.
 */
export enum ArrayAggregateOperation {
  Sum = 'SUM',
  Min = 'MIN',
  Max = 'MAX',
  And = 'AND',
  Or = 'OR',
  Xor = 'XOR',
  Match = 'MATCH',
  Used = 'USED',
}

/**
 * Redis array indexes are unsigned 64-bit integers (0 … 2^64-1) and exceed
 * `Number.MAX_SAFE_INTEGER`, so we keep them as canonical decimal strings
 * end-to-end. Use `parseArrayIndex` / `isValidArrayIndex` from
 * `uiSrc/utils/arrayIndex` for any user input.
 */

export interface ArrayDataElement {
  /** Slot index — unsigned 64-bit integer as a decimal string. */
  index: string
  /** Stored value, or `null` for an empty slot. */
  value: RedisString | null
}

/**
 * Match criteria for an ARGREP predicate. Values are the literal command
 * tokens; mirrors the backend `ArrayGrepCriteria` enum.
 */
export enum ArrayGrepCriteria {
  Exact = 'EXACT',
  Match = 'MATCH',
  Glob = 'GLOB',
  Re = 'RE',
}

/** One criteria/value pair sent to ARGREP. */
export interface ArrayGrepPredicate {
  criteria: ArrayGrepCriteria
  /** Pattern / value to match — a plain string is a valid `RedisString`. */
  value: string
}

export interface ArrayData {
  keyName: RedisString
  /** ARLEN — highest set index + 1 (includes gaps). Decimal string. */
  length: string
  /** ARCOUNT — count of populated (non-empty) slots. Decimal string. */
  count: string
  /**
   * Currently loaded elements. Population depends on which thunk last
   * resolved: `fetchArrayRange` fills gaps with `value: null`, while
   * `scanArrayRange` skips empty slots entirely.
   */
  elements: ArrayDataElement[]
}

/**
 * Last query the user (or initial-load effect) actually executed. Tracked
 * on the slice so the key-header refresh button can replay it instead of
 * falling back to fixed defaults that ignore the form's current bounds /
 * gap-mode toggle.
 */
export interface ArrayActiveQuery {
  start: string
  end: string
  /** true → ARGETRANGE (gap-preserving); false → ARSCAN (populated-only). */
  showEmpty: boolean
}

/**
 * Aggregate (AROP) result slice. Held alongside the range/scan data so the
 * Aggregate tab can keep its last result visible while the View tab updates
 * independently. `result` mirrors the BE response (`string | null`): a
 * decimal/integer string for a value reply, or `null` for a nil reply (e.g.
 * SUM over a range with no numeric values). `hasResult` distinguishes
 * "pristine — no AROP has run yet" from "ran and got nil"; both shapes
 * present `result: null`.
 */
/**
 * Last AROP query the user executed. Tracked on the slice (mirroring
 * `ArrayActiveQuery`) so the key-header refresh button can replay it and
 * keep the displayed aggregate in sync with the array's current contents
 * — without it, refresh would update length/count but leave a stale
 * aggregate result on screen. `null` until the first run.
 */
export interface ArrayAggregateActiveQuery {
  start: string
  end: string
  operation: ArrayAggregateOperation
  /** Present only when `operation === Match`. */
  value?: string
}

export interface ArrayAggregateState {
  loading: boolean
  error: string
  result: string | null
  hasResult: boolean
  query: ArrayAggregateActiveQuery | null
}

/**
 * Search (ARGREP) sub-state, kept separate from the View tab's range state
 * so the two tabs — both mounted at once — never clobber each other's
 * results. `loaded` flips true once the first search resolves (success or
 * failure) so the tab can stay blank until the user actually runs one.
 * `predicates` records the last-run query so the key-details refresh button
 * can replay it (mirrors `ArrayActiveQuery` for the View tab).
 */
export interface ArraySearchState {
  loading: boolean
  error: string
  loaded: boolean
  data: ArrayDataElement[]
  predicates: ArrayGrepPredicate[]
}

export interface StateArray {
  loading: boolean
  error: string
  query: ArrayActiveQuery
  data: ArrayData
  aggregate: ArrayAggregateState
  search: ArraySearchState
}

export interface FetchArrayRangeParams {
  key: RedisString
  start: string
  end: string
  resetData?: boolean
}

export interface FetchArrayScanParams {
  key: RedisString
  start: string
  end: string
  resetData?: boolean
}

export interface FetchArrayAggregateParams {
  key: RedisString
  start: string
  end: string
  operation: ArrayAggregateOperation
  /** Required when `operation === Match`; ignored otherwise. */
  value?: string
  /**
   * When `false` (header refresh replay), keeps the last result/`hasResult`
   * visible while the recompute is in flight so the panel doesn't flash a
   * loader. Defaults to a fresh run that clears the previous result.
   */
  resetData?: boolean
}

/**
 * ARGREP search request. Only the predicates are modelled here; the thunk
 * pins a safety LIMIT and lets the API default the rest (range, NOCASE, and
 * WITHVALUES — `true`, so the response carries values for the table).
 */
export interface SearchArrayParams {
  key: RedisString
  predicates: ArrayGrepPredicate[]
}

/**
 * Re-export the auto-generated SDK response shapes for consumers that need
 * to pass them around. The slice itself narrows them into `ArrayData` /
 * `ArrayDataElement` for storage.
 */
export type {
  AggregateArrayDto,
  AggregateArrayResponse,
  GetArrayCountResponse,
  GetArrayLengthResponse,
  GetArrayRangeResponse,
  GetArraySearchResponse,
  GetArrayScanResponse,
}
