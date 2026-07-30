import { ParseKeys } from 'i18next'
import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'

export const ARRAY_SEARCH_FORM_TEST_ID = 'array-search-form'

export const MATCH_BY_LABEL: ParseKeys = 'browser.array.search.matchByLabel'
export const MATCH_BY_HINT: ParseKeys = 'browser.array.search.matchByHint'
export const VALUE_PLACEHOLDER: ParseKeys =
  'browser.array.search.valuePlaceholder'
export const RUN_BUTTON_LABEL: ParseKeys = 'browser.array.form.run'
export const RESET_TOOLTIP: ParseKeys = 'browser.array.form.resetTooltip'
export const RESET_ARIA_LABEL: ParseKeys = 'browser.array.search.resetAria'
export const ADD_PREDICATE_ARIA: ParseKeys =
  'browser.array.search.addPredicateAria'
export const REMOVE_PREDICATE_ARIA: ParseKeys =
  'browser.array.search.removePredicateAria'
export const COMBINATOR_ARIA: ParseKeys = 'browser.array.search.combinatorAria'
export const APPLIES_TO_ALL_LABEL: ParseKeys =
  'browser.array.search.appliesToAll'

export const OPTIONS_LABEL: ParseKeys = 'browser.array.search.optionsLabel'
export const OPTIONS_HINT: ParseKeys = 'browser.array.search.optionsHint'
export const RANGE_LABEL: ParseKeys = 'browser.array.search.rangeLabel'
export const RANGE_TO_LABEL: ParseKeys = 'browser.array.search.rangeToLabel'
export const START_PLACEHOLDER = '-'
export const END_PLACEHOLDER = '+'
export const NOCASE_LABEL = 'NOCASE'
export const WITHVALUES_LABEL = 'WITHVALUES'
export const LIMIT_LABEL = 'LIMIT'

/** Per-option (i) hints rendered next to each control. */
export const RANGE_HINT: ParseKeys = 'browser.array.search.rangeHint'
export const NOCASE_HINT: ParseKeys = 'browser.array.search.nocaseHint'
export const WITHVALUES_HINT: ParseKeys = 'browser.array.search.withValuesHint'
export const LIMIT_HINT: ParseKeys = 'browser.array.search.limitHint'

export const INVALID_INDEX_MESSAGE: ParseKeys =
  'browser.array.form.invalidIndex'
/** Backend caps ARGREP LIMIT at `ARRAY_RANGE_MAX_ELEMENTS` (1,000,000). */
export const ARRAY_SEARCH_LIMIT_MAX = 1_000_000
export const INVALID_LIMIT_MESSAGE: ParseKeys =
  'browser.array.search.invalidLimit'

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
