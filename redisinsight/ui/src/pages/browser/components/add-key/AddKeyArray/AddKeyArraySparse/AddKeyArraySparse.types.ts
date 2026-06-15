import type { SparseValue } from '../AddKeyArray.types'

export interface Props {
  disabled?: boolean
  value: SparseValue
  onChange: (value: SparseValue) => void
}
