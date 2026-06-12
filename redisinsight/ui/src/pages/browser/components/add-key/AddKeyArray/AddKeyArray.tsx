import React from 'react'

import { Maybe } from 'uiSrc/utils'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
  setKeyName?: (value: string) => void
  setKeyNameDisabled?: (disabled: boolean) => void
}

// Creation forms land in follow-up PRs; submit stays disabled until then.
const AddKeyArray = ({ onCancel }: Props) => (
  <>
    <Text size="M" color="secondary" data-testid="add-key-array-placeholder">
      Array creation options are coming soon.
    </Text>
    <ActionFooter
      onCancel={() => onCancel(true)}
      onAction={() => undefined}
      actionText="Add Key"
      disabled
      actionTestId="add-key-array-btn"
    />
  </>
)

export default AddKeyArray
