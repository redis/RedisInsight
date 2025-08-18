import React from 'react'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { CancelSlimIcon } from 'uiBase/icons'
import styles from './styles.module.scss'

export interface Props {
  width: number
  selectionCount: number
  actions: (JSX.Element | null)[]
  onCloseActionBar: () => void
}

const ActionBar = ({
  width,
  selectionCount,
  actions,
  onCloseActionBar,
}: Props) => (
  <div className={styles.inner}>
    <RiRow
      centered
      className={styles.container}
      gap="l"
      style={{
        left: `calc(${width / 2}px - 156px)`,
      }}
    >
      <RiFlexItem className={styles.text}>
        {`You selected: ${selectionCount} items`}
      </RiFlexItem>
      {actions?.map((action, index) => (
        <RiFlexItem className={styles.actions} key={`action-${index + 1}`}>
          {action}
        </RiFlexItem>
      ))}
      <RiFlexItem className={styles.cross}>
        <RiIconButton
          icon={CancelSlimIcon}
          aria-label="Cancel selecting"
          onClick={() => onCloseActionBar()}
          data-testid="cancel-selecting"
        />
      </RiFlexItem>
    </RiRow>
  </div>
)

export default ActionBar
