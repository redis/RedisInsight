export interface PreviewToggleProps {
  /** Whether the command preview is currently shown. */
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  /** Wide layout → full "Preview command" label; narrow → "Preview". */
  wide?: boolean
  'data-testid'?: string
}
