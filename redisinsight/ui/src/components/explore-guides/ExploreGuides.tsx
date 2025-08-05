import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { guideLinksSelector } from 'uiSrc/slices/content/guide-links'

import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { findTutorialPath } from 'uiSrc/utils'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
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
      <Title size="XS">
        <span>Here&apos;s a good starting point</span>
      </Title>
      <Text>
        Explore the amazing world of Redis Stack with our interactive guides
      </Text>
      <RiSpacer size="xl" />
      {!!data.length && (
        <div className={styles.guides}>
          {data.map(({ title, tutorialId, icon }) => (
            <div
              key={title}
              role="button"
              tabIndex={0}
              onKeyDown={() => {}}
              onClick={() => handleLinkClick(tutorialId)}
              className={styles.btn}
              data-testid={`guide-button-${tutorialId}`}
            >
              {icon in GUIDE_ICONS && (
                <RiIcon
                  className={styles.icon}
                  type={GUIDE_ICONS[icon]}
                  data-testid={`guide-icon-${icon}`}
                />
              )}
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExploreGuides
