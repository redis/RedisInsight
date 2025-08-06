import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'

import { RiPrimaryButton } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { DEFAULT_DELIMITER, FeatureFlags, Pages } from 'uiSrc/constants'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import WelcomeIcon from 'uiSrc/assets/img/icons/welcome.svg?react'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { comboBoxToArray } from 'uiSrc/utils'
import {
  ANALYZE_CLUSTER_TOOLTIP_MESSAGE,
  ANALYZE_TOOLTIP_MESSAGE,
} from 'uiSrc/constants/recommendations'
import { FeatureFlagComponent } from 'uiSrc/components'
import PopoverRunAnalyze from '../popover-run-analyze'

import styles from './styles.module.scss'

const NoRecommendationsScreen = () => {
  const { provider, connectionType } = useSelector(connectedInstanceSelector)
  const {
    data: { recommendations },
  } = useSelector(recommendationsSelector)
  const { treeViewDelimiter = [DEFAULT_DELIMITER] } =
    useSelector(appContextDbConfig)

  const [isShowInfo, setIsShowInfo] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()
  const history = useHistory()

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
    setIsShowInfo(false)
  }

  return (
    <div className={styles.container} data-testid="no-recommendations-screen">
      <RiText className={styles.bigText}>Welcome to</RiText>
      <RiText className={styles.hugeText}>Tips!</RiText>
      <RiText className={styles.mediumText}>
        Where we help improve your database.
      </RiText>
      <RiText className={cx(styles.text, styles.bigMargin)}>
        New tips appear while you work with your database, including how to
        improve performance and optimize memory usage.
      </RiText>
      <WelcomeIcon className={styles.icon} />
      {instanceId ? (
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <RiText
            className={styles.text}
            data-testid="no-recommendations-analyse-text"
          >
            Eager for more tips? Run Database Analysis to get started.
          </RiText>

          <PopoverRunAnalyze
            isShowPopover={isShowInfo}
            setIsShowPopover={setIsShowInfo}
            onApproveClick={handleClickDbAnalysisLink}
            popoverContent={
              connectionType === ConnectionType.Cluster
                ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                : ANALYZE_TOOLTIP_MESSAGE
            }
          >
            <RiPrimaryButton
              size="s"
              onClick={() => setIsShowInfo(true)}
              data-testid="insights-db-analysis-link"
            >
              Analyze Database
            </RiPrimaryButton>
          </PopoverRunAnalyze>
        </FeatureFlagComponent>
      ) : (
        <RiText
          className={styles.text}
          data-testid="no-recommendations-analyse-text"
        >
          Eager for tips? Connect to a database to get started.
        </RiText>
      )}
    </div>
  )
}

export default NoRecommendationsScreen
