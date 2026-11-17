import { ParseKeys } from 'i18next'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

export const ARRAY_AGGREGATE_FORM_TEST_ID = 'array-aggregate-form'

export const RUN_BUTTON_LABEL: ParseKeys = 'browser.array.form.run'
export const RESET_TOOLTIP: ParseKeys = 'browser.array.form.resetTooltip'
export const INVALID_INDEX_MESSAGE: ParseKeys =
  'browser.array.form.invalidIndex'

/**
 * Mirror of the backend's `ARRAY_RANGE_MAX_ELEMENTS` cap — AROP reuses
 * `assertValidRange` so the same span limit applies.
 */
export const ARRAY_RANGE_MAX_SPAN = 1_000_000n
export const INVALID_RANGE_TOO_LARGE_MESSAGE: ParseKeys =
  'browser.array.aggregate.tooLarge'

export const OPERATION_OPTIONS: ReadonlyArray<{
  value: ArrayAggregateOperation
  inputDisplay: string
}> = [
  { value: ArrayAggregateOperation.Sum, inputDisplay: 'SUM' },
  { value: ArrayAggregateOperation.Min, inputDisplay: 'MIN' },
  { value: ArrayAggregateOperation.Max, inputDisplay: 'MAX' },
  { value: ArrayAggregateOperation.And, inputDisplay: 'AND' },
  { value: ArrayAggregateOperation.Or, inputDisplay: 'OR' },
  { value: ArrayAggregateOperation.Xor, inputDisplay: 'XOR' },
  { value: ArrayAggregateOperation.Match, inputDisplay: 'MATCH' },
  { value: ArrayAggregateOperation.Used, inputDisplay: 'USED' },
]
