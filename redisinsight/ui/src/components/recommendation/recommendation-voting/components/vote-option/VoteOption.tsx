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
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import { getVotedText, iconType, voteTooltip } from './utils'
import * as S from './VoteOption.styles'

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
      panelClassName="popoverLikeTooltip"
      button={
        <RiTooltip
          content={getTooltipContent(voteOption)}
          position="bottom"
          data-testid={`${voteOption}-vote-tooltip`}
        >
          <S.VotingIconButton
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
      <S.PopoverWrapper data-testid={`${name}-${voteOption}-popover`}>
        <Col align="end">
          <FlexItem>
            <Row>
              <FlexItem>
                <S.PetardIcon>
                  <RiIcon type="PetardIcon" />
                </S.PetardIcon>
              </FlexItem>
              <FlexItem grow>
                <div>
                  <S.VotingText as={Text} data-testid="common-text">
                    Thank you for the feedback.
                  </S.VotingText>
                  <S.VotingText as={Text} data-testid="custom-text">
                    {getVotedText(voteOption)}
                  </S.VotingText>
                </div>
              </FlexItem>
              <FlexItem>
                <S.CloseBtn
                  icon={CancelSlimIcon}
                  id="close-voting-popover"
                  aria-label="close popover"
                  data-testid="close-popover"
                  onClick={() => setPopover('')}
                />
              </FlexItem>
            </Row>
          </FlexItem>
          <FlexItem grow>
            <S.GitHubLink
              data-testid="recommendation-feedback-btn"
              href={EXTERNAL_LINKS.recommendationFeedback}
              target="_blank"
              data-test-subj="github-repo-link"
            >
              <S.GithubIcon>
                <RiIcon
                  aria-label="redis insight github issues"
                  type="GithubIcon"
                  color="informative100"
                  data-testid="github-repo-icon"
                />
              </S.GithubIcon>
              To Github
            </S.GitHubLink>
          </FlexItem>
        </Col>
      </S.PopoverWrapper>
    </RiPopover>
  )
}

export default VoteOption
