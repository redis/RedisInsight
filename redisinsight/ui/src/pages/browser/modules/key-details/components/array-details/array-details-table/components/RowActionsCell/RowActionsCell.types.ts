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
  closePopover: () => void
  showPopover: (item: string) => void
  handleDeleteElement: (index: string) => void
}

export interface RowActionsCellProps {
  element: ArrayDataElement
  deleteConfig: ArrayElementDeleteConfig
}
