import { Maybe } from 'uiSrc/utils'

import type { PopulateMode } from './constants'

export interface PopulateOption {
  value: PopulateMode
  label: string
  description?: string
  disabled?: boolean
  id: string
}

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
  setKeyName?: (value: string) => void
  setKeyNameDisabled?: (disabled: boolean) => void
}
