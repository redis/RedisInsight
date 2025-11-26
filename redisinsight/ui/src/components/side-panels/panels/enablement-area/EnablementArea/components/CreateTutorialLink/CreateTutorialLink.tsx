import React from 'react'
import { useParams } from 'react-router-dom'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { Link } from 'uiSrc/components/base/link/Link'

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
    <Link
      external
      underline
      size="S"
      variant="inline"
      onClick={onClickReadMore}
      href={EXTERNAL_LINKS.guidesRepo}
      data-testid="read-more-link"
    >
      Create your tutorial
    </Link>
  )
}

export default CreateTutorialLink
