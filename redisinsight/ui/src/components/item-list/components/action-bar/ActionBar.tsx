import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
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
    <Row
      centered
      className={styles.container}
      gap="l"
      style={{
        left: `calc(${width / 2}px - 156px)`,
      }}
    >
      <FlexItem className={styles.text}>
        {`You selected: ${selectionCount} items`}
      </FlexItem>
      {actions?.map((action, index) => (
        <FlexItem className={styles.actions} key={`action-${index + 1}`}>
          {action}
        </FlexItem>
      ))}
      <FlexItem className={styles.cross}>
        <RiIconButton
          icon={CancelSlimIcon}
          aria-label="Cancel selecting"
          onClick={() => onCloseActionBar()}
          data-testid="cancel-selecting"
        />
      </FlexItem>
    </Row>
  </div>
)

export default ActionBar
