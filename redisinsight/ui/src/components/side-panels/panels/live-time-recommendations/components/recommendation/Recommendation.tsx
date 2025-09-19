import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { isUndefined } from 'lodash'

import { findTutorialPath, Maybe, Nullable } from 'uiSrc/utils'
import { FeatureFlags, Pages, Theme } from 'uiSrc/constants'
import {
  FeatureFlagComponent,
  RecommendationBody,
  RecommendationCopyComponent,
  RecommendationVoting,
  RiTooltip,
} from 'uiSrc/components'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  deleteLiveRecommendations,
  updateLiveRecommendation,
} from 'uiSrc/slices/recommendations/recommendations'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  IRecommendationParams,
  IRecommendationsStatic,
} from 'uiSrc/slices/interfaces/recommendations'

import {
  HideIcon,
  ShowIcon,
  SnoozeIcon,
  StarsIcon,
} from 'uiSrc/components/base/icons'

import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Card } from 'uiSrc/components/base/layout'
import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import { Link } from 'uiSrc/components/base/link/Link'
import { Title } from 'uiSrc/pages/vector-search/manage-indexes/styles'

import styles from './styles.module.scss'

const TITLE_TRUNCATE_LENGTH = 30 // Note: Temporary dirty fix for RI-7474, before the full redesign of this component

export interface IProps {
  id: string
  name: string
  isRead: boolean
  vote: Nullable<Vote>
  hide: boolean
  tutorialId?: string
  provider?: string
  params: IRecommendationParams
  recommendationsContent: IRecommendationsStatic
}

const RecommendationContent = styled(Card)`
  padding: 0;
  border: none;
  box-shadow: none;
`

const RecommendationTitle = ({
  redisStack,
  title,
  id,
}: {
  redisStack: Maybe<boolean>
  title?: string
  id: string
}) => {
  const { theme } = useContext(ThemeContext)
  return (
    <Row
      align="center"
      justify="start"
      gap="m"
      style={{
        maxWidth: '60%',
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      {redisStack && (
        <FlexItem>
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
        </FlexItem>
      )}
      <div className="truncateText">
        <span title={title}>{title}</span>
      </div>
    </Row>
  )
}

const Recommendation = ({
  id,
  name,
  isRead,
  vote,
  tutorialId,
  hide,
  provider,
  params,
  recommendationsContent,
}: IProps) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const {
    redisStack,
    title,
    liveTitle,
    content = [],
  } = recommendationsContent[name] || {}

  const handleRedirect = () => {
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name].telemetryEvent || name,
        provider,
      },
    })

    if (!tutorialId) {
      history.push(Pages.workbench(instanceId))
      return
    }

    const tutorialPath = findTutorialPath({ id: tutorialId })
    dispatch(openTutorialByPath(tutorialPath ?? '', history))
  }

  const toggleHide = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    dispatch(
      updateLiveRecommendation(id, { hide: !hide }, ({ hide, name }) =>
        sendEventTelemetry({
          event: TelemetryEvent.INSIGHTS_TIPS_HIDE,
          eventData: {
            databaseId: instanceId,
            action: hide ? 'hide' : 'show',
            name: recommendationsContent[name]?.telemetryEvent ?? name,
            provider,
          },
        }),
      ),
    )
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    dispatch(deleteLiveRecommendations([{ id, isRead }], onSuccessActionDelete))
  }

  const onSuccessActionDelete = () => {
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_SNOOZED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        provider,
      },
    })
  }

  const onRecommendationLinkClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_LINK_CLICKED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        provider,
      },
    })
  }

  const recommendationContent = () => (
    <Col>
      {!isUndefined(tutorialId) && (
        <SecondaryButton
          filled
          icon={StarsIcon}
          iconSide="right"
          className={styles.btn}
          onClick={handleRedirect}
          data-testid={`${name}-to-tutorial-btn`}
        >
          {tutorialId ? 'Start Tutorial' : 'Workbench'}
        </SecondaryButton>
      )}
      <RecommendationBody
        elements={content}
        params={params}
        onLinkClick={onRecommendationLinkClick}
        telemetryName={recommendationsContent[name]?.telemetryEvent ?? name}
        insights
      />

      {!!params?.keys?.length && (
        <RecommendationCopyComponent
          keyName={params.keys[0]}
          provider={provider}
          telemetryEvent={recommendationsContent[name]?.telemetryEvent ?? name}
          live
        />
      )}
      <FeatureFlagComponent name={FeatureFlags.envDependent}>
        <div className={styles.actions}>
          <RecommendationVoting
            live
            id={id}
            vote={vote}
            name={name}
            containerClass={styles.votingContainer}
          />
        </div>
      </FeatureFlagComponent>
    </Col>
  )

  const renderButtonContent = (
    <Row className={styles.fullWidth} align="center" gap="s" justify="between">
      <FlexItem>
        <RiTooltip
          title="Snooze tip"
          content="This tip will be removed from the list and displayed again when relevant."
          position="top"
          anchorClassName="flex-row"
        >
          <IconButton
            icon={SnoozeIcon}
            className={styles.snoozeBtn}
            onClick={handleDelete}
            aria-label="snooze tip"
            data-testid={`${name}-delete-btn`}
          />
        </RiTooltip>
      </FlexItem>
      <FlexItem>
        <RiTooltip
          title={`${hide ? 'Show' : 'Hide'} tip`}
          content={`${
            hide
              ? 'This tip will be shown in the list.'
              : 'This tip will be removed from the list and not displayed again.'
          }`}
          position="top"
          anchorClassName="flex-row"
        >
          <IconButton
            icon={hide ? HideIcon : ShowIcon}
            className={styles.hideBtn}
            onClick={toggleHide}
            aria-label="hide/unhide tip"
            data-testid={`toggle-hide-${name}-btn`}
          />
        </RiTooltip>
      </FlexItem>
    </Row>
  )

  if (!(name in recommendationsContent)) {
    return null
  }

  return (
    <div
      data-testid={`${name}-recommendation`}
      style={{ marginBottom: '1rem' }}
    >
      <RiAccordion
        id={name}
        defaultOpen={!isRead}
        actions={renderButtonContent}
        label={
          <RecommendationTitle
            redisStack={redisStack}
            title={title || liveTitle}
            id={name}
          />
        }
        data-testid={`${name}-accordion`}
        aria-label={`${name}-accordion`}
      >
        <Col>
          {/* Note: Temporary dirty fix for RI-7474, before the full redesign of this component */}
          {title?.length > TITLE_TRUNCATE_LENGTH && <Title>{title}</Title>}
          <RecommendationContent
            className={styles.accordionContent}
            color="subdued"
          >
            {recommendationContent()}
          </RecommendationContent>
        </Col>
      </RiAccordion>
    </div>
  )
}

export default Recommendation
