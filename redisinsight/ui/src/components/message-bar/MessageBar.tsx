import React, { useEffect, useState } from 'react'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiIconButton } from 'uiBase/forms'
import styles from './styles.module.scss'

export interface Props {
  children?: React.ReactElement
  opened: boolean
}

const MessageBar = ({ children, opened }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(opened)
  }, [opened])

  return isOpen ? (
    <div className={styles.inner}>
      <div className={styles.containerWrapper}>
        <RiRow centered className={styles.container} gap="l">
          <RiFlexItem grow className={styles.text}>
            {children}
          </RiFlexItem>
          <RiFlexItem className={styles.cross}>
            <RiIconButton
              icon={CancelSlimIcon}
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              data-testid="close-button"
            />
          </RiFlexItem>
        </RiRow>
      </div>
    </div>
  ) : null
}

export default MessageBar
