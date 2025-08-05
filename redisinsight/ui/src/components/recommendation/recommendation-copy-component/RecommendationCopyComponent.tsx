import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { bufferToString } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Text, ColorText } from 'uiSrc/components/base/text'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CopyIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface IProps {
  keyName: string
  provider?: string
  telemetryEvent: string
  live?: boolean
}

const RecommendationCopyComponent = ({
  live = false,
  keyName,
  telemetryEvent,
  provider,
}: IProps) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const formattedName = bufferToString(keyName)

  const handleCopy = () => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_TIPS_KEY_COPIED
        : TelemetryEvent.DATABASE_TIPS_KEY_COPIED,
      eventData: {
        databaseId: instanceId,
        name: telemetryEvent,
        provider,
      },
    })
    navigator?.clipboard?.writeText(formattedName)
  }

  return (
    <div className={styles.wrapper}>
      <Text className={styles.text}>
        Example of a key that may be relevant:
      </Text>
      <div className={styles.keyNameWrapper}>
        <ColorText
          color="subdued"
          className={cx(styles.keyName, 'truncateText', {
            [styles.dbAnalysis]: !live,
          })}
          component="div"
          data-testid="recommendation-key-name"
        >
          {formattedName}
        </ColorText>
        <RiIconButton
          onClick={handleCopy}
          className={styles.btn}
          icon={CopyIcon}
          data-testid="copy-key-name-btn"
          aria-label="copy key name"
        />
      </div>
    </div>
  )
}

export default RecommendationCopyComponent
