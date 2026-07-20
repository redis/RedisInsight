import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'

import { ARRAY_SEARCH_LIMIT_MAX } from './ArraySearchForm.constants'

// A blank bound is valid (omitted → server `-`/`+`); a non-blank one must be a
// canonical u64 index, matching the backend `@IsArrayIndex` validator.
export const isBoundInvalid = (bound: string): boolean =>
  bound !== '' && parseArrayIndex(bound) !== bound

// LIMIT must be a whole number in 1..ARRAY_SEARCH_LIMIT_MAX (the backend cap).
export const isLimitInvalid = (limit: string): boolean =>
  !/^[1-9]\d*$/.test(limit) || Number(limit) > ARRAY_SEARCH_LIMIT_MAX
