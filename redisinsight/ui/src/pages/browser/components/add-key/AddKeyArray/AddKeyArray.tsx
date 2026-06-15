import React from 'react'

import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { Text } from 'uiSrc/components/base/text'

import { Props } from './AddKeyArray.types'

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
