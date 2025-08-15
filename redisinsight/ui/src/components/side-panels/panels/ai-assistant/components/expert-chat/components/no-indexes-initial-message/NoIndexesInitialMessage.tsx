import React, { useEffect } from 'react'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import LoadSampleData from 'uiSrc/pages/browser/components/load-sample-data'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
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
      <Text size="xs">Hi!</Text>
      <Text size="xs">
        I am here to help you get started with data querying. I noticed that you
        have no indexes created.
      </Text>
      <Spacer />
      <Text size="xs">
        Would you like to load the sample data and indexes (from this{' '}
        <Link
          variant="small-inline"
          color="subdued"
          onClick={onClickTutorial}
          data-testid="tutorial-initial-message-link"
        >
          tutorial
        </Link>
        ) to see what Redis Copilot can help you do?
      </Text>
      <Spacer />
      <LoadSampleData
        anchorClassName={styles.anchorClassName}
        onSuccess={onSuccess}
      />
      <Spacer />
    </div>
  )
}

export default NoIndexesInitialMessage
