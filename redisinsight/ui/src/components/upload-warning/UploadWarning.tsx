import React from 'react'

import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiCallOut } from 'uiSrc/components/base/display'
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
