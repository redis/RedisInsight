import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'uiSrc/i18n'
import { CaretRightIcon } from 'uiSrc/components/base/icons'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { comboBoxToArray, getDbIndex, Nullable } from 'uiSrc/utils'
import { AnalyticsPageHeader } from 'uiSrc/pages/database-analysis/components/analytics-page-header'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FormatedDate, RiTooltip } from 'uiSrc/components'
import { DEFAULT_DELIMITER } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { HideFor } from 'uiSrc/components/base/utils/ShowHide'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'

import styles from './styles.module.scss'
import { Container, HeaderSelect, InfoIcon } from './Header.styles'
import { ShortDatabaseAnalysis, AnalysisProgress } from 'apiClient'

export interface Props {
  items: ShortDatabaseAnalysis[]
  selectedValue: Nullable<string>
  progress?: AnalysisProgress
  analysisLoading: boolean
  onChangeSelectedAnalysis: (value: string) => void
}

const Header = (props: Props) => {
  const {
    items = [],
    selectedValue,
    onChangeSelectedAnalysis,
    progress = null,
    analysisLoading,
  } = props

  const { t } = useTranslation()
  const { connectionType, provider } = useAppSelector(connectedInstanceSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useAppDispatch()

  const { treeViewDelimiter = [DEFAULT_DELIMITER] } =
    useAppSelector(appContextDbConfig)

  const analysisOptions = items.map((item) => {
    const { createdAt, id, db } = item
    return {
      value: id || '',
      label: createdAt?.toString() || '',
      inputDisplay: (
        <>
          <span
            data-test-subj={`items-report-${id}`}
          >{`${getDbIndex(db)} `}</span>
          <FormatedDate date={createdAt || ''} />
        </>
      ),
    }
  })

  const handleClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_STARTED,
      eventData: {
        databaseId: instanceId,
        provider,
      },
    })
    dispatch(createNewAnalysis(instanceId, comboBoxToArray(treeViewDelimiter)))
  }

  return (
    <div data-testid="db-analysis-header">
      <AnalyticsPageHeader
        actions={
          <Container justify={items.length ? 'between' : 'end'} gap="l">
            {!!items.length && (
              <FlexItem>
                <Row align="center" wrap>
                  <HideFor sizes={['xs', 's']}>
                    <FlexItem>
                      <Text size="s">
                        {t(
                          'analytics.databaseAnalysis.header.reportGeneratedOn',
                        )}
                      </Text>
                    </FlexItem>
                  </HideFor>
                  <FlexItem grow>
                    <HeaderSelect
                      options={analysisOptions}
                      valueRender={({ option }) =>
                        option.inputDisplay as JSX.Element
                      }
                      value={selectedValue ?? ''}
                      onChange={(value: string) =>
                        onChangeSelectedAnalysis(value)
                      }
                      data-testid="select-report"
                    />
                  </FlexItem>
                  {!!progress && (
                    <FlexItem>
                      <Text
                        className={styles.progress}
                        size="s"
                        data-testid="bulk-delete-summary"
                      >
                        <Text
                          component="span"
                          color={
                            progress.total === progress.processed
                              ? undefined
                              : 'warning'
                          }
                          className={styles.progress}
                          size="s"
                          data-testid="analysis-progress"
                        >
                          {t('analytics.databaseAnalysis.header.scanned', {
                            percentage: getApproximatePercentage(
                              progress.total,
                              progress.processed,
                            ),
                          })}
                        </Text>{' '}
                        {t('analytics.databaseAnalysis.header.scannedKeys', {
                          processed: numberWithSpaces(progress.processed),
                          total: numberWithSpaces(progress.total),
                        })}
                      </Text>
                    </FlexItem>
                  )}
                </Row>
              </FlexItem>
            )}
            <FlexItem>
              <Row justify="end" align="center" gap="s">
                <PrimaryButton
                  aria-label={t(
                    'analytics.databaseAnalysis.header.newReportAria',
                  )}
                  data-testid="start-database-analysis-btn"
                  icon={CaretRightIcon}
                  iconSide="left"
                  size="small"
                  disabled={analysisLoading}
                  onClick={handleClick}
                >
                  {t('analytics.databaseAnalysis.header.newReport')}
                </PrimaryButton>
                <RiTooltip
                  position="bottom"
                  anchorClassName={styles.tooltipAnchor}
                  title={t('analytics.databaseAnalysis.header.tooltipTitle')}
                  data-testid="db-new-reports-tooltip"
                  content={
                    connectionType === ConnectionType.Cluster
                      ? t(
                          'analytics.databaseAnalysis.header.tooltipContentCluster',
                        )
                      : t('analytics.databaseAnalysis.header.tooltipContent')
                  }
                >
                  <InfoIcon data-testid="db-new-reports-icon" />
                </RiTooltip>
              </Row>
            </FlexItem>
          </Container>
        }
      />
    </div>
  )
}

export default Header
