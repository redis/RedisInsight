import {
  AggregateArrayDto,
  AggregateArrayResponse,
  GetArrayCountResponse,
  GetArrayLengthResponse,
  GetArrayRangeResponse,
  GetArraySearchResponse,
  GetArrayScanResponse,
} from 'apiClient'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

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

/**
 * Single global connective applied across all predicates. Only meaningful
 * with two or more predicates; a single predicate ignores it. Mirrors the
 * backend `ArrayCombinator` enum.
 */
export enum ArrayCombinator {
  And = 'AND',
  Or = 'OR',
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
 * `query` records the full last-run request (predicates + options) so the
 * key-details refresh button can replay it; `null` until the first run.
 */
export interface ArraySearchState {
  loading: boolean
  error: string
  loaded: boolean
  data: ArrayDataElement[]
  query: ArraySearchActiveQuery | null
}

export interface StateArray {
  loading: boolean
  error: string
  /** True while an inline ARSET edit is in flight, so the table can block
   *  overlapping edits and keep the header refresh paused until it settles. */
  updating: boolean
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

/** Append a value to the end of the array (ARSET at the current length,
 *  computed server-side). The key is always a buffer (the selected key), so
 *  the stale-key guard can compare it byte-exactly with isEqualBuffers. */
export interface AppendArrayElementParams {
  key: RedisResponseBuffer
  value: RedisString
  /** Connected instance id when the add was requested. The write is cancelled
   *  if the live connection no longer matches — a pending production-write
   *  confirmation must not write into a database the user has since switched
   *  to. */
  expectedInstanceId?: string
}

/** Add a value at an explicit index (ARSET key index value). Index is a
 *  numeric string per the unsigned-64-bit contract. */
export interface AddArrayElementParams {
  key: RedisResponseBuffer
  index: string
  value: RedisString
  /** See AppendArrayElementParams.expectedInstanceId. */
  expectedInstanceId?: string
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
 * ARGREP search request, sans key. `combinator` is only meaningful with two
 * or more predicates. Blank `start`/`end` are omitted by the thunk so the
 * server applies its `-`/`+` (whole-array) defaults; `nocase`/`withValues`/
 * `limit` map to the matching ARGREP options.
 */
export interface ArraySearchActiveQuery {
  predicates: ArrayGrepPredicate[]
  combinator?: ArrayCombinator
  start?: string
  end?: string
  nocase?: boolean
  withValues?: boolean
  limit?: number
}

/** ARGREP search request for the `searchArray` thunk (query + target key). */
export interface SearchArrayParams extends ArraySearchActiveQuery {
  key: RedisString
}

/**
 * Search-tab form state for the ARGREP options (everything except the
 * predicate rows + global connective). `limit` is a string so the input can
 * be edited freely; `limitEnabled` gates whether the user's value is used or
 * the default safety cap applies. Blank `start`/`end` mean "whole array".
 */
export interface ArraySearchOptions {
  start: string
  end: string
  nocase: boolean
  withValues: boolean
  limitEnabled: boolean
  limit: string
}

/**
 * ARSET single-element edit (Modify vertical). `index` addresses the slot to
 * overwrite; `value` is the serialized-buffer payload the formatter pipeline
 * expects (built via `stringToSerializedBufferFormat`). The key must already
 * exist — this edits a loaded element, it never creates a key.
 */
export interface UpdateArrayElementParams {
  key: RedisString
  index: string
  value: RedisString
  /** Connected instance id when the edit was initiated. When set, the write is
   *  skipped if the connected database has since changed (e.g. a production-
   *  write confirmation confirmed after switching connections). */
  startInstanceId?: string
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
