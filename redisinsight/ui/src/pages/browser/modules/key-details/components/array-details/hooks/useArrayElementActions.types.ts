import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'
import { ArrayBulkDeleteConfig } from '../array-details-table/components/BulkDeleteHeaderCell'
import { ArrayElementSelectionConfig } from '../array-details-table/ArrayDetailsTable.types'

export interface UseArrayElementActionsParams {
  /** The currently rendered result set (View range or Search matches). Bulk
   *  selection is pruned to these so it can never delete an index that a range
   *  change or a new search has scrolled out of view. */
  elements: ArrayDataElement[]
  /** Whether `value == null` rows are gaps (View) and so hide the affordance,
   *  or real index-only matches (Search) that stay deletable. */
  hideEmptySlots: boolean
}

export interface UseArrayElementActionsResult {
  /** Per-row delete affordance config for the table's actions column. */
  deleteConfig: ArrayElementDeleteConfig
  /** Multi-select config forwarded to the table. */
  selectionConfig: ArrayElementSelectionConfig
  /** Bulk-delete config for the actions-column header (count + delete). */
  bulkDeleteConfig: ArrayBulkDeleteConfig
  /** Clears the multi-select; consumers call it on query reset. */
  clearSelection: () => void
}
