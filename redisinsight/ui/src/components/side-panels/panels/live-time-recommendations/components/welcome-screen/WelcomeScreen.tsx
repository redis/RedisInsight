import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'

import { useTranslation } from 'uiSrc/i18n'
import { DEFAULT_DELIMITER, FeatureFlags, Pages } from 'uiSrc/constants'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import WelcomeIcon from 'uiSrc/assets/img/icons/welcome.svg?react'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { comboBoxToArray } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/components'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import PopoverRunAnalyze from '../popover-run-analyze'

import styles from './styles.module.scss'

const NoRecommendationsScreen = () => {
  const { t } = useTranslation()
  const { provider, connectionType } = useAppSelector(connectedInstanceSelector)
  const {
    data: { recommendations },
  } = useAppSelector(recommendationsSelector)
  const { treeViewDelimiter = [DEFAULT_DELIMITER] } =
    useAppSelector(appContextDbConfig)

  const [isShowInfo, setIsShowInfo] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useAppDispatch()
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
      <Text className={styles.bigText}>{t('tips.welcome.title')}</Text>
      <Text className={styles.hugeText}>{t('tips.welcome.product')}</Text>
      <Text className={styles.mediumText}>{t('tips.welcome.subtitle')}</Text>
      <Text className={cx(styles.text, styles.bigMargin)}>
        {t('tips.newTipsInfo')}
      </Text>
      <WelcomeIcon className={styles.icon} />
      {instanceId ? (
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <Text
            className={styles.text}
            data-testid="no-recommendations-analyse-text"
          >
            {t('tips.eagerForMoreTips')}
          </Text>

          <PopoverRunAnalyze
            isShowPopover={isShowInfo}
            setIsShowPopover={setIsShowInfo}
            onApproveClick={handleClickDbAnalysisLink}
            popoverContent={t(
              connectionType === ConnectionType.Cluster
                ? 'tips.runAnalysis.tooltipCluster'
                : 'tips.runAnalysis.tooltip',
            )}
          >
            <PrimaryButton
              size="s"
              onClick={() => setIsShowInfo(true)}
              data-testid="insights-db-analysis-link"
            >
              {t('tips.welcome.analyzeButton')}
            </PrimaryButton>
          </PopoverRunAnalyze>
        </FeatureFlagComponent>
      ) : (
        <Text
          className={styles.text}
          data-testid="no-recommendations-analyse-text"
        >
          {t('tips.welcome.connectPrompt')}
        </Text>
      )}
    </div>
  )
}

export default NoRecommendationsScreen
