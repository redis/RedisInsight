export interface FilterInputWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  disabled?: boolean
  'data-testid'?: string
}

export interface ActiveDotToken {
  dotIndex: number
  prefix: string
}
