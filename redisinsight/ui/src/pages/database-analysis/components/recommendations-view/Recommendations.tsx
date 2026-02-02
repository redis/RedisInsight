import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { isNull } from 'lodash'

import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  FeatureFlagComponent,
  RecommendationBadges,
  RecommendationBadgesLegend,
  RecommendationBody,
  RecommendationCopyComponent,
  RecommendationVoting,
  RiTooltip,
} from 'uiSrc/components'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags, Theme } from 'uiSrc/constants'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sortRecommendations } from 'uiSrc/utils/recommendation'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { findTutorialPath } from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'

import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import { RediStackMinIcon } from 'uiSrc/components/base/icons'

import * as S from './Recommendations.styles'

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { provider } = useSelector(connectedInstanceSelector)
  const { content: recommendationsContent } = useSelector(
    recommendationsSelector,
  )
  const { recommendations = [] } = data ?? {}

  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleToggle = (isOpen: boolean, id: string) =>
    sendEventTelemetry({
      event: isOpen
        ? TelemetryEvent.DATABASE_ANALYSIS_TIPS_EXPANDED
        : TelemetryEvent.DATABASE_ANALYSIS_TIPS_COLLAPSED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
        provider,
      },
    })

  const goToTutorial = (tutorialId: string, id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
        provider,
      },
    })

    const tutorialPath = findTutorialPath({ id: tutorialId || '' })
    dispatch(openTutorialByPath(tutorialPath || '', history))
  }

  const onRedisStackClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => event.stopPropagation()

  const renderButtonContent = (badges: string[], id: string) => (
    <FlexItem className="recommendation-badges" data-test-subj={`${id}-button`}>
      <RecommendationBadges badges={badges} />
    </FlexItem>
  )
  const renderLabel = (redisStack: boolean, title: string, id: string) => (
    <S.AccordionLabel data-test-subj={`${id}-label`}>
      {redisStack && (
        <FlexItem onClick={onRedisStackClick}>
          <S.RedisStackLink
            target="_blank"
            href={EXTERNAL_LINKS.redisStack}
            data-testid={`${id}-redis-stack-link`}
          >
            <RiTooltip
              content="Redis Stack"
              position="top"
              anchorClassName="flex-row"
            >
              <S.RedisStackIcon data-testid={`${id}-redis-stack-icon`}>
                <RediStackMinIcon />
              </S.RedisStackIcon>
            </RiTooltip>
          </S.RedisStackLink>
        </FlexItem>
      )}
      <FlexItem>{title}</FlexItem>
    </S.AccordionLabel>
  )

  if (loading) {
    return <S.LoadingWrapper data-testid="recommendations-loader" />
  }

  if (isNull(recommendations) || !recommendations.length) {
    return (
      <S.EmptyContainer data-testid="empty-recommendations-message">
        <S.NoRecommendationsIcon
          type={
            theme === Theme.Dark
              ? 'NoRecommendationsDarkIcon'
              : 'NoRecommendationsLightIcon'
          }
          data-testid="no=recommendations-icon"
        />
        <S.BigText>AMAZING JOB!</S.BigText>
        <Text size="m">No Tips at the moment,</Text>
        <br />
        <Text size="m">keep up the good work!</Text>
      </S.EmptyContainer>
    )
  }

  return (
    <S.Wrapper>
      <RecommendationBadgesLegend />
      <S.RecommendationsContainer>
        {sortRecommendations(recommendations, recommendationsContent).map(
          ({ name, params, vote }) => {
            const {
              id = '',
              title = '',
              content = [],
              badges = [],
              redisStack = false,
              tutorialId,
              telemetryEvent,
            } = recommendationsContent[name] || {}

            if (!(name in recommendationsContent)) {
              return null
            }

            return (
              <S.Recommendation key={id} data-testid={`${id}-recommendation`}>
                <RiAccordion
                  id={name}
                  key={`${name}-accordion`}
                  label={renderLabel(redisStack, title, id)}
                  actions={renderButtonContent(badges, id)}
                  defaultOpen
                  onOpenChange={(isOpen) => handleToggle(isOpen, id)}
                  data-testid={`${id}-accordion`}
                >
                  <S.RecommendationContent>
                    <RecommendationBody
                      elements={content}
                      params={params}
                      telemetryName={telemetryEvent ?? name}
                    />
                    {!!params?.keys?.length && (
                      <RecommendationCopyComponent
                        keyName={params.keys[0]}
                        provider={provider}
                        telemetryEvent={
                          recommendationsContent[name]?.telemetryEvent ?? name
                        }
                      />
                    )}
                  </S.RecommendationContent>
                </RiAccordion>
                <S.Footer>
                  <FeatureFlagComponent name={FeatureFlags.envDependent}>
                    <RecommendationVoting vote={vote as Vote} name={name} />
                  </FeatureFlagComponent>
                  {tutorialId && (
                    <PrimaryButton
                      size="s"
                      onClick={() => goToTutorial(tutorialId, id)}
                      data-testid={`${id}-to-tutorial-btn`}
                    >
                      Tutorial
                    </PrimaryButton>
                  )}
                </S.Footer>
              </S.Recommendation>
            )
          },
        )}
      </S.RecommendationsContainer>
    </S.Wrapper>
  )
}

export default Recommendations
