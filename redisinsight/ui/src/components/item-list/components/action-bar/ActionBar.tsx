import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Container } from './ActionBar.styles'

export interface Props {
  width?: number
  selectionCount: number
  actions: (JSX.Element | null)[]
  onCloseActionBar: () => void
}

const ActionBar = ({ selectionCount, actions, onCloseActionBar }: Props) => (
  <Container centered gap="l">
    <FlexItem>{`You selected: ${selectionCount} items`}</FlexItem>
    {actions?.map((action, index) => (
      <FlexItem key={`action-${index + 1}`}>{action}</FlexItem>
    ))}
    <FlexItem>
      <IconButton
        icon={CancelSlimIcon}
        aria-label="Cancel selecting"
        onClick={() => onCloseActionBar()}
        data-testid="cancel-selecting"
      />
    </FlexItem>
  </Container>
)

export default ActionBar
