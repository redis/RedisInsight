export interface DeleteRangeActionProps {
  /** Used to close the confirm popover when the selected key changes. */
  keyName?: string
  /** Live [start, end] indexes the delete targets (BigInt-as-string). */
  start: string
  end: string
  /** Disables the action while the range query is in flight. */
  loading?: boolean
  /**
   * Disables the trigger on top of the internal index validation — set while
   * the selected key's array type is not yet confirmed.
   */
  disabled?: boolean
  /** Runs ARDELRANGE over the inclusive [start, end] window. */
  onDeleteRange: () => void
}
