export interface PreviewToggleProps {
  /** Whether the command preview is currently shown. */
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  /** Wide layout → full "Preview command" label; narrow → "Preview". */
  wide?: boolean
  /** Blocks toggling, e.g. while the form has no query to preview yet. */
  disabled?: boolean
  /** Tooltip shown instead of the "show" one while `disabled`. */
  disabledTooltip?: string
  'data-testid'?: string
}
