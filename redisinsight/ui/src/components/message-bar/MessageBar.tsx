import React, { useEffect, useState } from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { RiIconButton } from 'uiSrc/components/base/forms'
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
        <Row centered className={styles.container} gap="l">
          <FlexItem grow className={styles.text}>
            {children}
          </FlexItem>
          <FlexItem className={styles.cross}>
            <RiIconButton
              icon={CancelSlimIcon}
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              data-testid="close-button"
            />
          </FlexItem>
        </Row>
      </div>
    </div>
  ) : null
}

export default MessageBar
