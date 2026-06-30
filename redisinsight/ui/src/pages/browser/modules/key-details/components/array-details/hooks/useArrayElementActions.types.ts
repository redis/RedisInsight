import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'

export interface UseArrayElementActionsParams {
  /** Runs after a successful delete to refresh the surface's visible rows
   *  (the View tab re-runs its range/scan query; the Search tab re-runs the
   *  search). Skipped when the delete removed the last element. */
  onDeleted: () => void
}

export interface UseArrayElementActionsResult {
  deleteConfig: ArrayElementDeleteConfig
}
