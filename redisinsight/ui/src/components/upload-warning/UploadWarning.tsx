import React from 'react'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import { RiCallOut } from 'uiBase/display'
import styles from './styles.module.scss'

const UploadWarning = () => (
  <RiCallOut variant="attention" className={styles.wrapper}>
    <RiRow gap="s" align="center">
      <RiFlexItem>
        <RiIcon color="attention500" type="IndicatorErrorIcon" />
      </RiFlexItem>
      <RiFlexItem>
        <RiText className={styles.warningMessage}>
          Use files only from trusted authors to avoid automatic execution of
          malicious code.
        </RiText>
      </RiFlexItem>
    </RiRow>
  </RiCallOut>
)

export default UploadWarning
