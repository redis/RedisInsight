import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { CaretRightIcon } from 'uiSrc/components/base/icons'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { comboBoxToArray, getDbIndex, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  ANALYZE_CLUSTER_TOOLTIP_MESSAGE,
  ANALYZE_TOOLTIP_MESSAGE,
} from 'uiSrc/constants/recommendations'
import { FormatedDate, RiTooltip } from 'uiSrc/components'
import { DEFAULT_DELIMITER } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { HideFor } from 'uiSrc/components/base/utils/ShowHide'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { AnalysisProgress } from 'apiSrc/modules/database-analysis/models/analysis-progress'

import styles from './styles.module.scss'
import { Container, HeaderSelect, InfoIcon } from './Header.styles'

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

  const { connectionType, provider } = useSelector(connectedInstanceSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { treeViewDelimiter = [DEFAULT_DELIMITER] } =
    useSelector(appContextDbConfig)

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
      <AnalyticsTabs />
      <Container justify={items.length ? 'between' : 'end'}>
        {!!items.length && (
          <FlexItem>
            <Row align="center" wrap>
              <HideFor sizes={['xs', 's']}>
                <FlexItem>
                  <Text size="s">Report generated on:</Text>
                </FlexItem>
              </HideFor>
              <FlexItem grow>
                <HeaderSelect
                  options={analysisOptions}
                  valueRender={({ option }) =>
                    option.inputDisplay as JSX.Element
                  }
                  value={selectedValue ?? ''}
                  onChange={(value: string) => onChangeSelectedAnalysis(value)}
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
                      {`Scanned ${getApproximatePercentage(
                        progress.total,
                        progress.processed,
                      )}`}
                    </Text>
                    {` (${numberWithSpaces(progress.processed)}`}/
                    {numberWithSpaces(progress.total)}
                    {' keys) '}
                  </Text>
                </FlexItem>
              )}
            </Row>
          </FlexItem>
        )}
        <FlexItem>
          <Row justify="end" align="center" gap="s">
            <PrimaryButton
              aria-label="New reports"
              data-testid="start-database-analysis-btn"
              icon={CaretRightIcon}
              iconSide="left"
              disabled={analysisLoading}
              onClick={handleClick}
            >
              New Report
            </PrimaryButton>
            <RiTooltip
              position="bottom"
              anchorClassName={styles.tooltipAnchor}
              title="Database Analysis"
              data-testid="db-new-reports-tooltip"
              content={
                connectionType === ConnectionType.Cluster
                  ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                  : ANALYZE_TOOLTIP_MESSAGE
              }
            >
              <InfoIcon data-testid="db-new-reports-icon" />
            </RiTooltip>
          </Row>
        </FlexItem>
      </Container>
    </div>
  )
}

export default Header
