export interface BulkDeleteBarProps {
  /** Number of currently-selected rows; the bar is hidden when 0. */
  selectedCount: number
  /** Deletes every selected element (after confirmation). */
  onBulkDelete: () => void
  /** Clears the current selection. */
  onClear: () => void
}
