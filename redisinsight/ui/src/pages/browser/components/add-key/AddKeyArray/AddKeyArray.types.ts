import { Maybe } from 'uiSrc/utils'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
  /**
   * Setter for the parent-owned `keyName` field. Used by the sample-dataset
   * mode to auto-populate the common key-name input with a bundled dataset's
   * fixed key, and clear it again on switching back to manual entry.
   */
  setKeyName?: (value: string) => void
  /**
   * Setter for the parent-owned `keyName` input's `disabled` flag. Locked to
   * `true` in sample-dataset mode (the key name is fixed) and `false` otherwise.
   */
  setKeyNameDisabled?: (disabled: boolean) => void
}
