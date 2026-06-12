import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { Nullable } from 'uiSrc/utils'

export interface ArrayDetailsTableProps {
  elements: ArrayDataElement[]
  loading: boolean
}

/**
 * Shared cell config passed to the redis-ui table via `meta`. Lets the
 * static column definitions read `compressor`/`viewFormat` at render time
 * without each cell having to close over them via the parent component.
 */
export interface ArrayTableConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}
