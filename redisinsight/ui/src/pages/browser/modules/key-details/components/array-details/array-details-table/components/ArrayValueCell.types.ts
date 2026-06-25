import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

export interface ArrayValueCellProps {
  index: string
  value: ArrayDataElement['value']
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  /** True when this row's value is currently in edit mode. */
  isEditing?: boolean
  /** True while an ARSET write is in flight — shows the editor's loading
   *  state and blocks opening another edit until it settles. */
  updating?: boolean
  /** Toggle edit mode for this row (open via the edit button, close on
   *  decline / successful apply). Omitted in read-only contexts. */
  onEdit?: (isEditing: boolean) => void
  /** Apply the edited value (already formatter-decoded to a plain string). */
  onApply?: (value: string) => void
}
