export interface ArrayRangeFormProps {
  /**
   * Key name rendered in the preview command. Optional so the form can be
   * rendered in isolation (tests, Storybook); in the live composition the
   * container always passes the selected key.
   */
  keyName?: string
  start: string
  end: string
  showEmpty: boolean
  loading: boolean
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  onToggleShowEmpty: (value: boolean) => void
  onRun: () => void
  /**
   * Optional reset hook — restores form defaults. The container owns the
   * actual reset semantics (resetting Redux state alongside form state).
   */
  onReset?: () => void
  /**
   * Disables the Run / Reset actions in addition to the form's internal
   * range validation. Container passes `true` while the selected key's
   * confirmed type/name has not caught up with the clicked key yet so a
   * quick click cannot dispatch a query against a non-array key.
   */
  disabled?: boolean
}
