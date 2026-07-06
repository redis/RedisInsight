import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

/**
 * Per-row delete state shared with the table's actions cell via the table
 * `meta`. Owned by `useArrayElementActions`; passed down so the static column
 * definition stays free of component state.
 */
export interface ArrayElementDeleteConfig {
  /** `${index}${suffix}` of the row whose confirm popover is open, or ''. */
  deleting: string
  suffix: string
  /** Hide the affordance on `value == null` rows. True for the gap-preserving
   *  View range (a null is an empty slot); false for Search, where an
   *  index-only match (WITHVALUES off) has a null value but is a real,
   *  deletable element. */
  hideEmptySlots: boolean
  closePopover: () => void
  showPopover: (item: string) => void
  handleDeleteElement: (index: string) => void
}

export interface RowActionsCellProps {
  element: ArrayDataElement
  deleteConfig: ArrayElementDeleteConfig
}
