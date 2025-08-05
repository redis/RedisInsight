import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { isNull } from 'lodash'
import cx from 'classnames'

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
import { RiFlexItem, RiRow, RiCard } from 'uiSrc/components/base/layout'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'

import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import { Link } from 'uiSrc/components/base/link/Link'

import styles from './styles.module.scss'

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
    <RiFlexItem
      className="recommendation-badges"
      data-test-subj={`${id}-button`}
    >
      <RecommendationBadges badges={badges} />
    </RiFlexItem>
  )
  const renderLabel = (redisStack: boolean, title: string, id: string) => (
    <RiRow
      className={cx(styles.accordionBtn, styles.accordionButton)}
      align="center"
      justify="start"
      gap="m"
      data-test-subj={`${id}-label`}
    >
      <RiFlexItem onClick={onRedisStackClick}>
        {redisStack && (
          <Link
            target="_blank"
            href={EXTERNAL_LINKS.redisStack}
            className={styles.redisStackLink}
            data-testid={`${id}-redis-stack-link`}
          >
            <RiTooltip
              content="Redis Stack"
              position="top"
              anchorClassName="flex-row"
            >
              <RiIcon
                type={
                  theme === Theme.Dark
                    ? 'RediStackDarkMinIcon'
                    : 'RediStackLightMinIcon'
                }
                className={styles.redisStackIcon}
                data-testid={`${id}-redis-stack-icon`}
              />
            </RiTooltip>
          </Link>
        )}
      </RiFlexItem>
      <RiFlexItem>{title}</RiFlexItem>
    </RiRow>
  )

  if (loading) {
    return (
      <div
        className={styles.loadingWrapper}
        data-testid="recommendations-loader"
      />
    )
  }

  if (isNull(recommendations) || !recommendations.length) {
    return (
      <div
        className={styles.container}
        data-testid="empty-recommendations-message"
      >
        <RiIcon
          type={
            theme === Theme.Dark
              ? 'NoRecommendationsDarkIcon'
              : 'NoRecommendationsLightIcon'
          }
          className={styles.noRecommendationsIcon}
          data-testid="no=recommendations-icon"
        />
        <Text className={styles.bigText}>AMAZING JOB!</Text>
        <Text size="m">No Tips at the moment,</Text>
        <br />
        <Text size="m">keep up the good work!</Text>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <RecommendationBadgesLegend />
      <div className={styles.recommendationsContainer}>
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
              <div
                key={id}
                className={styles.recommendation}
                data-testid={`${id}-recommendation`}
              >
                <RiAccordion
                  id={name}
                  key={`${name}-accordion`}
                  label={renderLabel(redisStack, title, id)}
                  actions={renderButtonContent(badges, id)}
                  className={styles.accordion}
                  defaultOpen
                  onOpenChange={(isOpen) => handleToggle(isOpen, id)}
                  data-testid={`${id}-accordion`}
                >
                  <RiCard className={styles.accordionContent}>
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
                  </RiCard>
                </RiAccordion>
                <div className={styles.footer}>
                  <FeatureFlagComponent name={FeatureFlags.envDependent}>
                    <RecommendationVoting vote={vote as Vote} name={name} />
                  </FeatureFlagComponent>
                  {tutorialId && (
                    <RiPrimaryButton
                      size="s"
                      onClick={() => goToTutorial(tutorialId, id)}
                      data-testid={`${id}-to-tutorial-btn`}
                    >
                      Tutorial
                    </RiPrimaryButton>
                  )}
                </div>
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}

export default Recommendations
