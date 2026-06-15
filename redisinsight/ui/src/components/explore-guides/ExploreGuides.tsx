import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory, useParams } from 'react-router-dom'
import { guideLinksSelector } from 'uiSrc/slices/content/guide-links'

import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { findTutorialPath } from 'uiSrc/utils'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import * as S from './ExploreGuides.styles'

const ExploreGuides = () => {
  const { data } = useAppSelector(guideLinksSelector)
  const { provider } = useAppSelector(connectedInstanceSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const history = useHistory()
  const dispatch = useAppDispatch()

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
      <S.CenteredTitle color="primary" size="S">
        Here&apos;s a good starting point
      </S.CenteredTitle>
      <Spacer size="s" />
      <Text color="primary" textAlign="center">
        Explore the amazing world of Redis with our interactive guides
      </Text>
      <Spacer size="xl" />
      {!!data.length && (
        <S.Guides gap="l" wrap justify="center">
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
        </S.Guides>
      )}
    </div>
  )
}

export default ExploreGuides
