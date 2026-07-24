export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  // called once the last digit fills, so the caller can auto-submit
  onComplete?: (value: string) => void
  length?: number
  isInvalid?: boolean
  disabled?: boolean
  autoFocus?: boolean
  ariaLabel?: string
  'data-testid'?: string
}
