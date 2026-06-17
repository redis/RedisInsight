import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

export interface ArrayValueCellProps {
  index: string
  value: ArrayDataElement['value']
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}
