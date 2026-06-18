import {
  AggregateArrayDto,
  AggregateArrayResponse,
  GetArrayCountResponse,
  GetArrayLengthResponse,
  GetArrayRangeResponse,
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
export interface ArrayAggregateState {
  loading: boolean
  error: string
  result: string | null
  hasResult: boolean
}

export interface StateArray {
  loading: boolean
  error: string
  query: ArrayActiveQuery
  data: ArrayData
  aggregate: ArrayAggregateState
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
  GetArrayScanResponse,
}
