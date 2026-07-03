/**
 * Bulk-delete state shared with the table's actions-column header via the
 * table `meta`. Owned by `useArrayElementActions`; the header renders a danger
 * trash from it only while rows are selected.
 */
export interface ArrayBulkDeleteConfig {
  /** Currently-selected, still-visible rows. */
  selectedCount: number
  /** Deletes every selected index in a single ARDEL and clears the selection. */
  handleBulkDelete: () => void
}

export interface BulkDeleteHeaderCellProps {
  bulkDeleteConfig: ArrayBulkDeleteConfig
}
