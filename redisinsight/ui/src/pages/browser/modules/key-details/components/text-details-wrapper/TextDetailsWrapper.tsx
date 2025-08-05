import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

const TextDetailsWrapper = ({
  onClose,
  children,
  testid,
}: {
  onClose: () => void
  children: ReactNode
  testid?: string
}) => {
  const getDataTestid = (suffix: string) =>
    testid ? `${testid}-${suffix}` : suffix

  return (
    <div className={styles.container} data-testid={getDataTestid('details')}>
      <RiTooltip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <RiIconButton
          icon={CancelSlimIcon}
          aria-label="Close key"
          className={styles.closeBtn}
          onClick={() => onClose()}
          data-testid={getDataTestid('close-key-btn')}
        />
      </RiTooltip>
      <Row centered>
        <FlexItem className={styles.textWrapper}>
          <div>{children}</div>
        </FlexItem>
      </Row>
    </div>
  )
}

export default TextDetailsWrapper
