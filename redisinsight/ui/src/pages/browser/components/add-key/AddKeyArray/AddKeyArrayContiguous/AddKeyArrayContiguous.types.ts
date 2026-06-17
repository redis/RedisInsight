import type { ContiguousValue } from '../AddKeyArray.types'

export interface AddKeyArrayContiguousProps {
  disabled?: boolean
  value: ContiguousValue
  onChange: (value: ContiguousValue) => void
}
