import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { guideLinksSelector } from 'uiSrc/slices/content/guide-links'

import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { findTutorialPath } from 'uiSrc/utils'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

const ExploreGuides = () => {
  const { data } = useSelector(guideLinksSelector)
  const { provider } = useSelector(connectedInstanceSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const history = useHistory()
  const dispatch = useDispatch()

  const handleLinkClick = (tutorialId: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: instanceId,
        tutorialId,
        provider,
        source: 'empty browser',
      },
    })

    const tutorialPath = findTutorialPath({ id: tutorialId ?? '' })
    dispatch(openTutorialByPath(tutorialPath ?? '', history))
  }

  return (
    <div data-testid="explore-guides">
      <Title color="primary" size="S" textAlign="center">
        <span>Here&apos;s a good starting point</span>
      </Title>
      <Spacer size="s" />
      <Text color="primary" textAlign="center">
        Explore the amazing world of Redis with our interactive guides
      </Text>
      <Spacer size="xl" />
      {!!data.length && (
        <FlexGroup gap="l" wrap justify="center" className={styles.guides}>
          {data.map(({ title, tutorialId, icon }) => (
            <SecondaryButton
              key={tutorialId}
              inverted
              tabIndex={0}
              onClick={() => handleLinkClick(tutorialId)}
              data-testid={`guide-button-${tutorialId}`}
            >
              {icon in GUIDE_ICONS && (
                <RiIcon
                  type={GUIDE_ICONS[icon]}
                  data-testid={`guide-icon-${icon}`}
                  color="inherit"
                />
              )}
              {title}
            </SecondaryButton>
          ))}
        </FlexGroup>
      )}
    </div>
  )
}

export default ExploreGuides
