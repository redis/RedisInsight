export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  isInvalid?: boolean
  disabled?: boolean
  autoFocus?: boolean
  ariaLabel?: string
  'data-testid'?: string
}
