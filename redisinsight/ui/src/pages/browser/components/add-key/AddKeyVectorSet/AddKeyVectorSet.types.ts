import { Maybe } from 'uiSrc/utils'
import { PopulateMode } from './constants'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

export interface PopulateOption {
  value: PopulateMode
  label: string
  description?: string
  disabled?: boolean
  id: string
}
