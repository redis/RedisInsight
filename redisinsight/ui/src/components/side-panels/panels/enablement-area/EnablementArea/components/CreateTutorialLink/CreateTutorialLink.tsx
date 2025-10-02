import React from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink } from 'uiSrc/components'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import styles from './styles.module.scss'

const CreateTutorialLink = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const onClickReadMore = () => {
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_CREATE_TUTORIAL_LINK_CLICKED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
      },
    })
  }

  return (
    <ExternalLink
      color="text"
      className={styles.readMoreLink}
      onClick={onClickReadMore}
      href={EXTERNAL_LINKS.guidesRepo}
      data-testid="read-more-link"
    >
      Create your tutorial
    </ExternalLink>
  )
}

export default CreateTutorialLink
