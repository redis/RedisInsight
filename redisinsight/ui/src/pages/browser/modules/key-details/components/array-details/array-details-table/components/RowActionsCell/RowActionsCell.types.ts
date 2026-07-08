import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

/**
 * Per-row edit wiring the actions cell reads from the table `meta` to render
 * the edit (inline) and expand (Monaco drawer) triggers next to delete. The
 * editing state lives in `ArrayDetailsTable` (`editingIndex`); these callbacks
 * open it and persist the result via ARSET.
 */
export interface ArrayElementEditConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  editingIndex: Nullable<string>
  updating: boolean
  /** Blocks opening an edit so a late read can't overwrite the optimistic patch. */
  loading: boolean
  onEditElement: (index: string, isEditing: boolean) => void
  onApplyEditElement: (index: string, value: string) => void
}

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
  /** Enables the edit + expand triggers. Omitted in read-only contexts. */
  editConfig?: ArrayElementEditConfig
  /** Enables the delete trigger. Omitted when deletion isn't offered. */
  deleteConfig?: ArrayElementDeleteConfig
}
