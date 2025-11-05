import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  width?: number
  selectionCount: number
  actions: (JSX.Element | null)[]
  onCloseActionBar: () => void
}

const ActionBar = ({ selectionCount, actions, onCloseActionBar }: Props) => (
  <Row centered className={styles.container} gap="l">
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
  </Row>
)

export default ActionBar
