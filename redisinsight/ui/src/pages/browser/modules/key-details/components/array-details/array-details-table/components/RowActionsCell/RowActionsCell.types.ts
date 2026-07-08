import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

/**
 * Per-row edit wiring the actions cell reads from the table `meta` to render
 * the edit (inline) and expand (Monaco popup) triggers next to delete. The
 * editing state itself lives in `ArrayDetailsTable` (`editingIndex`); these
 * callbacks open it and persist the result via ARSET.
 */
export interface ArrayElementEditConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  /** Index of the row currently in edit mode, or null when none is. */
  editingIndex: Nullable<string>
  /** True while an ARSET write is in flight — blocks opening another edit. */
  updating: boolean
  /** True while a patched-view read is in flight — blocks opening an edit so a
   *  late response can't overwrite the optimistic patch. */
  loading: boolean
  /** Open / close inline edit for a row's value. */
  onEditElement: (index: string, isEditing: boolean) => void
  /** Persist an edited value (plain string) via ARSET. */
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
