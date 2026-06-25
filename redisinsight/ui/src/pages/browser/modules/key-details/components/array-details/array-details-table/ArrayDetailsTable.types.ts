import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { Nullable } from 'uiSrc/utils'

export interface ArrayDetailsTableProps {
  elements: ArrayDataElement[]
  loading: boolean
  /** Surfaces a failed ARGETRANGE/ARSCAN in the empty state so the table
   *  doesn't misleadingly read "No elements in range" when the request
   *  errored. The slice still also raises a toast via `addErrorNotification`. */
  error?: string
}

/**
 * Shared cell config passed to the redis-ui table via `meta`. Lets the
 * static column definitions read `compressor`/`viewFormat` at render time
 * without each cell having to close over them via the parent component.
 */
export interface ArrayTableConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  /** Index of the row currently in edit mode, or null when none is. */
  editingIndex: Nullable<string>
  /** Open / close inline edit for a row's value. */
  onEditElement: (index: string, isEditing: boolean) => void
  /** Persist an edited value (plain string from the editor) via ARSET. */
  onApplyEditElement: (index: string, value: string) => void
}
