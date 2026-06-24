import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'

export const ARRAY_SEARCH_FORM_TEST_ID = 'array-search-form'

export const CRITERIA_LABEL = 'Criteria'
export const VALUE_LABEL = 'Value'
export const VALUE_PLACEHOLDER = 'Value to match'
export const RUN_BUTTON_LABEL = 'Run'

export const PREVIEW_TOGGLE_LABEL = 'Show preview'
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
