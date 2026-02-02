import React from 'react'

import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { findTutorialPath } from 'uiSrc/utils'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'

import * as S from './QueryTutorials.styles'

export interface Props {
  tutorials: Array<{
    id: string
    title: string
  }>
  source: string
}

const QueryTutorials = ({ tutorials, source }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleClickTutorial = (id: string) => {
    const tutorialPath = findTutorialPath({ id })
    dispatch(openTutorialByPath(tutorialPath, history, true))

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        path: tutorialPath,
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        source,
      },
    })
  }

  return (
    <S.Container>
      <S.Title as={Text}>Tutorials:</S.Title>
      {tutorials.map(({ id, title }) => (
        <S.TutorialLink
          as={EmptyButton}
          role="button"
          key={id}
          onClick={() => handleClickTutorial(id)}
          data-testid={`query-tutorials-link_${id}`}
        >
          {title}
        </S.TutorialLink>
      ))}
    </S.Container>
  )
}

export default QueryTutorials
