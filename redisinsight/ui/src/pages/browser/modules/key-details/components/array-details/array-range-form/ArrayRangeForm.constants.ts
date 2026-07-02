export const ARRAY_RANGE_FORM_TEST_ID = 'array-range-form'

export const PREVIEW_TOGGLE_LABEL = 'Show preview'
export const PREVIEW_TOGGLE_ARIA_LABEL = 'Toggle command preview'
export const PREVIEW_TOGGLE_SHOW_TOOLTIP =
  'Show the Redis command that will run'
export const PREVIEW_TOGGLE_HIDE_TOOLTIP = 'Hide the command preview'

export const RUN_BUTTON_LABEL = 'Run'
export const RESET_TOOLTIP = 'Reset to defaults'

export const DELETE_RANGE_BUTTON_LABEL = 'Delete range'
export const DELETE_RANGE_TITLE = 'Delete range'
export const DELETE_RANGE_CONFIRM_LABEL = 'Remove'
export const INVALID_INDEX_MESSAGE =
  'Index must be a valid 64-bit unsigned integer'

/**
 * Mirror of the backend's `ARRAY_RANGE_MAX_ELEMENTS` cap used by
 * `ArrayService.assertValidRange` (a span greater than this is rejected
 * with a 400). Kept in BigInt to compose with the BigInt index math the
 * form already does without any precision-losing Number conversions.
 */
export const ARRAY_RANGE_MAX_SPAN = 1_000_000n
export const INVALID_RANGE_TOO_LARGE_MESSAGE =
  'Range too large — request at most 1,000,000 indexes per query'
