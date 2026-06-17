import type { SparseValue } from '../AddKeyArray.types'

export interface AddKeyArraySparseProps {
  disabled?: boolean
  value: SparseValue
  onChange: (value: SparseValue) => void
}
