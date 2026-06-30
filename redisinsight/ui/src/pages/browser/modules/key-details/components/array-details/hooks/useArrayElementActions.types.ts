import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'

export interface UseArrayElementActionsParams {
  /** Whether `value == null` rows are gaps (View) and so hide the affordance,
   *  or real index-only matches (Search) that stay deletable. */
  hideEmptySlots: boolean
}

export interface UseArrayElementActionsResult {
  deleteConfig: ArrayElementDeleteConfig
}
