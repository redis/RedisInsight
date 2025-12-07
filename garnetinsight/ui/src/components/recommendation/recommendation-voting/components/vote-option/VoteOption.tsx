import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Vote } from 'uiSrc/constants/recommendations'
import { putRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  recommendationsSelector,
  updateLiveRecommendation,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { CancelSlimIcon, Icon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import { getVotedText, iconType, voteTooltip } from './utils'
import styles from './styles.module.scss'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

const GitHubLink = styled(Link)`
  padding: 4px 8px 4px 4px;

  margin-top: 10px;
  height: 22px !important;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.button.variants.primary.normal?.bgColor};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.button.variants.primary.normal?.textColor};
  &:hover {
    text-decoration: none !important;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.components.button.variants.primary.hover?.bgColor};
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.button.variants.primary.normal?.textColor};
  }

  & > span {
    display: flex;
    gap: 4px;
    align-items: center;
  }
`

const VotingIconButton = styled(IconButton)`
  width: 28px !important;
  height: 28px !important;
  border-radius: 50%;
`

export interface Props {
  voteOption: Vote
  vote?: Nullable<Vote>
  popover: string
  isAnalyticsEnable?: boolean
  setPopover: (popover: string) => void
  live?: boolean
  id: string
  name: string
}

const VoteOption = (props: Props) => {
  const {
    voteOption,
    vote,
    popover,
    isAnalyticsEnable,
    setPopover,
    live,
    id,
    name,
  } = props

  const dispatch = useDispatch()
  const { id: instanceId = '', provider } = useSelector(
    connectedInstanceSelector,
  )
  const { content: recommendationsContent } = useSelector(
    recommendationsSelector,
  )

  const onSuccessVoted = ({
    vote,
    name,
  }: {
    name: string
    vote: Nullable<Vote>
  }) => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_TIPS_VOTED
        : TelemetryEvent.DATABASE_ANALYSIS_TIPS_VOTED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        vote,
        provider,
      },
    })
  }

  const handleClick = (name: string) => {
    setPopover(voteOption)

    if (live) {
      dispatch(
        updateLiveRecommendation(id, { vote: voteOption }, onSuccessVoted),
      )
    } else {
      dispatch(putRecommendationVote(name, voteOption, onSuccessVoted))
    }
  }

  const getTooltipContent = (voteOption: Vote) =>
    isAnalyticsEnable
      ? voteTooltip[voteOption]
      : 'Enable Analytics on the Settings page to vote for a tip'

  return (
    <RiPopover
      anchorPosition="rightCenter"
      isOpen={popover === voteOption}
      closePopover={() => setPopover('')}
      anchorClassName={styles.popoverAnchor}
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      button={
        <RiTooltip
          content={getTooltipContent(voteOption)}
          position="bottom"
          data-testid={`${voteOption}-vote-tooltip`}
        >
          <VotingIconButton
            disabled={!isAnalyticsEnable}
            icon={iconType[voteOption] ?? 'LikeIcon'}
            className={cx('vote__btn', { selected: vote === voteOption })}
            aria-label="vote useful"
            data-testid={`${voteOption}-vote-btn`}
            onClick={() => handleClick(name)}
          />
        </RiTooltip>
      }
    >
      <div
        className={styles.popoverWrapper}
        data-testid={`${name}-${voteOption}-popover`}
      >
        <Col align="end">
          <FlexItem>
            <Row>
              <FlexItem>
                <RiIcon type="PetardIcon" className={styles.petardIcon} />
              </FlexItem>
              <FlexItem grow>
                <div>
                  <Text className={styles.text} data-testid="common-text">
                    Thank you for the feedback.
                  </Text>
                  <Text className={styles.text} data-testid="custom-text">
                    {getVotedText(voteOption)}
                  </Text>
                </div>
              </FlexItem>
              <FlexItem>
                <IconButton
                  icon={CancelSlimIcon}
                  id="close-voting-popover"
                  aria-label="close popover"
                  data-testid="close-popover"
                  className={styles.closeBtn}
                  onClick={() => setPopover('')}
                />
              </FlexItem>
            </Row>
          </FlexItem>
          <FlexItem grow>
            <GitHubLink
              data-testid="recommendation-feedback-btn"
              className={styles.link}
              href={EXTERNAL_LINKS.recommendationFeedback}
              target="_blank"
              data-test-subj="github-repo-link"
            >
              <RiIcon
                className={styles.githubIcon}
                aria-label="garnet insight github issues"
                type="GithubIcon"
                color="informative100"
                data-testid="github-repo-icon"
              />
              To Github
            </GitHubLink>
          </FlexItem>
        </Col>
      </div>
    </RiPopover>
  )
}

export default VoteOption
