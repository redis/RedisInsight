import type { ContiguousValue } from '../AddKeyArray.types'

export interface Props {
  disabled?: boolean
  value: ContiguousValue
  onChange: (value: ContiguousValue) => void
}
