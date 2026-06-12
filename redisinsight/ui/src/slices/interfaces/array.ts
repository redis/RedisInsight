import {
  GetArrayCountResponse,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeResponse,
  GetArrayScanResponse,
} from 'apiClient'
import { RedisString } from 'uiSrc/slices/interfaces/app'

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
   * ARNEXT — next free index (only fetched on demand). Decimal string,
   * or `null` when the insertion cursor is exhausted (u64 max reached).
   * `undefined` means it hasn't been queried yet.
   */
  nextIndex?: string | null
  /**
   * Currently loaded elements. Population depends on which thunk last
   * resolved: `fetchArrayRange` fills gaps with `value: null`, while
   * `scanArrayRange` skips empty slots entirely.
   */
  elements: ArrayDataElement[]
}

export interface StateArray {
  loading: boolean
  error: string
  data: ArrayData
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
  limit?: number
  resetData?: boolean
}

export interface FetchArrayElementParams {
  key: RedisString
  index: string
}

export interface FetchArrayMultiElementsParams {
  key: RedisString
  indexes: string[]
}

/**
 * Re-export the auto-generated SDK response shapes for consumers that need
 * to pass them around (e.g. thunk callbacks). The slice itself narrows them
 * into `ArrayData` / `ArrayDataElement` for storage.
 */
export type {
  GetArrayCountResponse,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeResponse,
  GetArrayScanResponse,
}
