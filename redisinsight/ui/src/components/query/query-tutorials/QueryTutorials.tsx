import React from 'react'

import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { findTutorialPath } from 'uiSrc/utils'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { RiText } from 'uiSrc/components/base/text'
import { RiEmptyButton } from 'uiSrc/components/base/forms'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface Props {
  tutorials: Array<{
    id: string
    title: string
  }>
  source: string
}

const QueryTutorialsButton = styled(RiEmptyButton)`
  padding: 4px 8px;
  background-color: var(--browserTableRowEven);

  border-radius: 4px;
  border: 1px solid var(--separatorColor);

  color: var(--htmlColor) !important;
  font-size: 12px;

  &:not(:first-of-type) {
    margin-left: 8px;
  }

  &:hover,
  &:focus {
    color: var(--htmlColor);
    text-decoration: underline !important;
    outline: none !important;
    animation: none !important;
  }
`

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
    <div className={styles.container}>
      <RiText className={styles.title}>Tutorials:</RiText>
      {tutorials.map(({ id, title }) => (
        <QueryTutorialsButton
          role="button"
          key={id}
          className={styles.tutorialLink}
          onClick={() => handleClickTutorial(id)}
          data-testid={`query-tutorials-link_${id}`}
        >
          {title}
        </QueryTutorialsButton>
      ))}
    </div>
  )
}

export default QueryTutorials
