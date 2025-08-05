import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import styles from './styles.module.scss'

const UploadWarning = () => (
  <CallOut variant="attention" className={styles.wrapper}>
    <Row gap="s" align="center">
      <FlexItem>
        <RiIcon color="attention500" type="IndicatorErrorIcon" />
      </FlexItem>
      <FlexItem>
        <Text className={styles.warningMessage}>
          Use files only from trusted authors to avoid automatic execution of
          malicious code.
        </Text>
      </FlexItem>
    </Row>
  </CallOut>
)

export default UploadWarning
