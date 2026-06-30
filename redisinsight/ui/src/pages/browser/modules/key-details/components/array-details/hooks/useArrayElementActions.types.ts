import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'

export interface UseArrayElementActionsParams {
  /** Runs after a successful delete to refresh the surface's visible rows
   *  (the View tab re-runs its range/scan query; the Search tab re-runs the
   *  search). Skipped when the delete removed the last element. */
  onDeleted: () => void
  /** Whether `value == null` rows are gaps (View) and so hide the affordance,
   *  or real index-only matches (Search) that stay deletable. */
  hideEmptySlots: boolean
}

export interface UseArrayElementActionsResult {
  deleteConfig: ArrayElementDeleteConfig
}
