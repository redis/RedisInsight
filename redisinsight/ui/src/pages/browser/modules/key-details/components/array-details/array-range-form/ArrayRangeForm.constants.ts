import { ParseKeys } from 'i18next'

export const ARRAY_RANGE_FORM_TEST_ID = 'array-range-form'

export const RUN_BUTTON_LABEL: ParseKeys = 'browser.array.form.run'
export const RESET_TOOLTIP: ParseKeys = 'browser.array.form.resetTooltip'
export const INVALID_INDEX_MESSAGE: ParseKeys =
  'browser.array.form.invalidIndex'

/**
 * Mirror of the backend's `ARRAY_RANGE_MAX_ELEMENTS` cap used by
 * `ArrayService.assertValidRange` (a span greater than this is rejected
 * with a 400). Kept in BigInt to compose with the BigInt index math the
 * form already does without any precision-losing Number conversions.
 */
export const ARRAY_RANGE_MAX_SPAN = 1_000_000n
export const INVALID_RANGE_TOO_LARGE_MESSAGE: ParseKeys =
  'browser.array.range.tooLarge'
