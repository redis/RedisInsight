import { Maybe } from 'uiSrc/utils'
import { PopulateMode } from './constants'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
  /**
   * Setter for the parent-owned `keyName` field. Used to auto-populate the
   * common key-name input with the bundled dataset's fixed key when the user
   * switches into "Load sample dataset" mode, and clear it again on switching
   * back to manual entry.
   */
  setKeyName?: (value: string) => void
  /**
   * Setter for the parent-owned `keyName` input's `disabled` flag. Locked
   * to `true` in sample-dataset mode (the key name is fixed by the bundled
   * file) and `false` otherwise.
   */
  setKeyNameDisabled?: (disabled: boolean) => void
}

export interface PopulateOption {
  value: PopulateMode
  label: string
  description?: string
  disabled?: boolean
  id: string
}
