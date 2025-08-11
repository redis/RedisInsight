import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { remove } from 'lodash'
import styled from 'styled-components'

import { FeatureFlags, DEFAULT_DELIMITER, Pages } from 'uiSrc/constants'
import {
  ANALYZE_CLUSTER_TOOLTIP_MESSAGE,
  ANALYZE_TOOLTIP_MESSAGE,
} from 'uiSrc/constants/recommendations'
import {
  recommendationsSelector,
  fetchRecommendationsAction,
  readRecommendationsAction,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { IRecommendation } from 'uiSrc/slices/interfaces/recommendations'
import {
  appContextDbConfig,
  setRecommendationsShowHidden,
} from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { comboBoxToArray } from 'uiSrc/utils'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  FeatureFlagComponent,
  LoadingContent,
  RiTooltip,
} from 'uiSrc/components'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import PopoverRunAnalyze from './components/popover-run-analyze'
import styles from './styles.module.scss'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'

const FooterLink = styled.button<{
  onClick?: () => void;
  'data-testid'?: string;
  children?: React.ReactNode;
}>`
  font:
    normal normal 400 12px/14px Graphik,
    sans-serif !important;
  padding: 2px 0 0;
  margin: 0;
  text-decoration: underline !important;
  :hover {
    text-decoration: none !important;
  }
`

const LiveTimeRecommendations = () => {
  const { provider, connectionType } = useSelector(connectedInstanceSelector)
  const {
    loading,
    data: { recommendations },
    content: recommendationsContent,
  } = useSelector(recommendationsSelector)
  const {
    showHiddenRecommendations: isShowHidden,
    treeViewDelimiter = [DEFAULT_DELIMITER],
  } = useSelector(appContextDbConfig)

  const { instanceId } = useParams<{ instanceId: string }>()

  const [isShowApproveRun, setIsShowApproveRun] = useState<boolean>(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const isShowHiddenDisplayed = recommendations.filter((r) => r.hide).length > 0

  useEffect(() => {
    if (!instanceId) return undefined

    dispatch(fetchRecommendationsAction(instanceId))

    return () => {
      dispatch(readRecommendationsAction(instanceId))
    }
  }, [])

  const handleClickDbAnalysisLink = () => {
    dispatch(createNewAnalysis(instanceId, comboBoxToArray(treeViewDelimiter)))
    history.push(Pages.databaseAnalysis(instanceId))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: instanceId,
        total: recommendations?.length,
        provider,
      },
    })
    setIsShowApproveRun(false)
  }

  const onChangeShowHidden = (value: boolean) => {
    dispatch(setRecommendationsShowHidden(value))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_SHOW_HIDDEN,
      eventData: {
        action: !value ? 'hide' : 'show',
        ...getTelemetryData(recommendations),
      },
    })
  }

  const getTelemetryData = (recommendationsData: IRecommendation[]) => ({
    databaseId: instanceId,
    total: recommendationsData?.length,
    list: recommendationsData?.map(
      ({ name }) => recommendationsContent[name]?.telemetryEvent ?? name,
    ),
    provider,
  })

  const renderBody = () => {
    const recommendationsList = [...recommendations]
    if (!isShowHidden) {
      remove(recommendationsList, { hide: true })
    }

    if (!instanceId || !recommendationsList?.length) {
      return <WelcomeScreen />
    }

    return recommendationsList?.map(
      ({ id, name, read, vote, hide, params }) => (
        <Recommendation
          id={id}
          key={name}
          name={name}
          isRead={read}
          vote={vote}
          hide={hide}
          tutorialId={recommendationsContent[name]?.tutorialId}
          provider={provider}
          params={params}
          recommendationsContent={recommendationsContent}
        />
      ),
    )
  }

  const renderHeader = () => (
    <div className={styles.actions}>
      <Row align="center" gap="s">
        <ColorText variant="semiBold" className={styles.boldText}>
          Our Tips
        </ColorText>
        <RiTooltip
          position="bottom"
          className={styles.tooltip}
          content={
            <Text size="s">
              Tips will help you improve your database.
              <Spacer size="s" />
              New tips appear while you work with your database, including how
              to improve performance and optimize memory usage.
              <FeatureFlagComponent name={FeatureFlags.envDependent}>
                <>
                  <Spacer size="s" />
                  Eager for more tips? Run Database Analysis to get started.
                </>
              </FeatureFlagComponent>
            </Text>
          }
        >
          <RiIcon
            className={styles.infoIcon}
            type="InfoIcon"
            size="s"
            data-testid="recommendations-info-icon"
          />
        </RiTooltip>
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <a
            href={EXTERNAL_LINKS.githubRepo}
            target="_blank"
            data-testid="github-repo-btn"
          >
            <RiIcon
              className={styles.githubIcon}
              aria-label="redis insight github repository"
              type="GithubIcon"
              size="s"
              data-testid="github-repo-icon"
            />
          </a>
        </FeatureFlagComponent>
      </Row>

      {isShowHiddenDisplayed && (
        <Checkbox
          id="showHidden"
          name="showHidden"
          label="Show hidden"
          checked={isShowHidden}
          className={styles.hideCheckbox}
          onChange={(e) => onChangeShowHidden(e.target.checked)}
          data-testid="checkbox-show-hidden"
          aria-label="checkbox show hidden"
        />
      )}
    </div>
  )

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        {instanceId && recommendations.length ? renderHeader() : null}
      </div>
      <div className={styles.body}>
        {loading ? (
          <LoadingContent className={styles.loading} lines={4} />
        ) : (
          renderBody()
        )}
      </div>
      {instanceId && (
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <div className={styles.footer}>
            <RiIcon
              className={styles.footerIcon}
              size="m"
              type="MessageInfoIcon"
            />
            <Text className={styles.text}>
              {'Run '}
              <PopoverRunAnalyze
                isShowPopover={isShowApproveRun}
                setIsShowPopover={setIsShowApproveRun}
                onApproveClick={handleClickDbAnalysisLink}
                popoverContent={
                  connectionType === ConnectionType.Cluster
                    ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                    : ANALYZE_TOOLTIP_MESSAGE
                }
              >
                <FooterLink
                  onClick={() => setIsShowApproveRun(true)}
                  data-testid="footer-db-analysis-link"
                >
                  Database Analysis
                </FooterLink>
              </PopoverRunAnalyze>
              {' to get more tips'}
            </Text>
          </div>
        </FeatureFlagComponent>
      )}
    </div>
  )
}

export default LiveTimeRecommendations
