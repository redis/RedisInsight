import React, { useEffect } from 'react'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import LoadSampleData from 'uiSrc/pages/browser/components/load-sample-data'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiText } from 'uiSrc/components/base/text'
import { RiLink } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

export interface Props {
  onSuccess?: () => void
  onClickTutorial: () => void
}

const NoIndexesInitialMessage = (props: Props) => {
  const { onSuccess, onClickTutorial } = props

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED,
    })
  }, [])

  return (
    <div data-testid="no-indexes-chat-message">
      <RiText size="xs">Hi!</RiText>
      <RiText size="xs">
        I am here to help you get started with data querying. I noticed that you
        have no indexes created.
      </RiText>
      <RiSpacer />
      <RiText size="xs">
        Would you like to load the sample data and indexes (from this{' '}
        <RiLink
          color="subdued"
          className="defaultLink"
          onClick={onClickTutorial}
          data-testid="tutorial-initial-message-link"
        >
          tutorial
        </RiLink>
        ) to see what Redis Copilot can help you do?
      </RiText>
      <RiSpacer />
      <LoadSampleData
        anchorClassName={styles.anchorClassName}
        onSuccess={onSuccess}
      />
      <RiSpacer />
    </div>
  )
}

export default NoIndexesInitialMessage
