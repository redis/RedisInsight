import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
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
      <RiRow centered>
        <RiFlexItem className={styles.textWrapper}>
          <div>{children}</div>
        </RiFlexItem>
      </RiRow>
    </div>
  )
}

export default TextDetailsWrapper
