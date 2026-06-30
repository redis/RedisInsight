import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'

export const ARRAY_SEARCH_FORM_TEST_ID = 'array-search-form'

export const MATCH_BY_LABEL = 'Match by'
export const MATCH_BY_HINT =
  'Add one or more predicates. Each matches array values by EXACT, MATCH ' +
  '(substring), GLOB, or RE (regex). With two or more predicates, the AND / ' +
  'OR toggle combines them all the same way.'
export const VALUE_PLACEHOLDER = 'pattern'
export const RUN_BUTTON_LABEL = 'Run'
export const RESET_TOOLTIP = 'Reset to defaults'
export const RESET_ARIA_LABEL = 'Reset array search form'
export const ADD_PREDICATE_ARIA = 'Add predicate'
export const REMOVE_PREDICATE_ARIA = 'Remove predicate'
export const COMBINATOR_ARIA = 'Combine predicates with AND or OR'
export const APPLIES_TO_ALL_LABEL = 'applies to all'

export const OPTIONS_LABEL = 'Options'
export const OPTIONS_HINT =
  'Refine which elements are searched and how matches are shown.'
export const RANGE_LABEL = 'Range'
export const RANGE_TO_LABEL = 'to'
export const START_PLACEHOLDER = '-'
export const END_PLACEHOLDER = '+'
export const NOCASE_LABEL = 'NOCASE'
export const WITHVALUES_LABEL = 'WITHVALUES'
export const LIMIT_LABEL = 'LIMIT'
export const CONTEXT_LABEL = 'Context'
export const CONTEXT_PREFIX = '±'

/** Per-option (i) hints rendered next to each control. */
export const RANGE_HINT =
  'Limits the index window searched (blank = whole array).'
export const NOCASE_HINT = 'Match case-insensitively.'
export const WITHVALUES_HINT = "Return each match's value, not just its index."
export const LIMIT_HINT = 'Cap the number of matches returned.'
export const CONTEXT_HINT =
  'When expanding a match, also show ±N neighbouring elements.'

export const INVALID_INDEX_MESSAGE =
  'Index must be a valid 64-bit unsigned integer'
/** Backend caps ARGREP LIMIT at `ARRAY_RANGE_MAX_ELEMENTS` (1,000,000). */
export const ARRAY_SEARCH_LIMIT_MAX = 1_000_000
export const INVALID_LIMIT_MESSAGE =
  'Limit must be a whole number between 1 and 1,000,000'

export const PREVIEW_TOGGLE_LABEL = 'Preview'
export const PREVIEW_TOGGLE_ARIA_LABEL = 'Toggle command preview'
export const PREVIEW_TOGGLE_SHOW_TOOLTIP =
  'Show the Redis command that will run'
export const PREVIEW_TOGGLE_HIDE_TOOLTIP = 'Hide the command preview'

/** Criteria dropdown options, in ARGREP command-token order. */
export const ARRAY_GREP_CRITERIA_OPTIONS: {
  value: ArrayGrepCriteria
  label: string
  inputDisplay: string
}[] = [
  { value: ArrayGrepCriteria.Exact, label: 'Exact', inputDisplay: 'Exact' },
  { value: ArrayGrepCriteria.Match, label: 'Match', inputDisplay: 'Match' },
  { value: ArrayGrepCriteria.Glob, label: 'Glob', inputDisplay: 'Glob' },
  { value: ArrayGrepCriteria.Re, label: 'Regex', inputDisplay: 'Regex' },
]
