import React from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import styled from 'styled-components'
import { CaretRightIcon, RiIcon } from 'uiBase/icons'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiHideFor } from 'uiBase/utils'
import { RiPrimaryButton, RiSelect } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
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
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { AnalysisProgress } from 'apiSrc/modules/database-analysis/models/analysis-progress'

import styles from './styles.module.scss'

const HeaderSelect = styled(RiSelect)`
  border: 0 none;
`
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
      <RiRow
        className={styles.container}
        align="center"
        justify={items.length ? 'between' : 'end'}
      >
        {!!items.length && (
          <RiFlexItem>
            <RiRow align="center" wrap>
              <RiHideFor sizes={['xs', 's']}>
                <RiFlexItem>
                  <RiText className={styles.text} size="s">
                    Report generated on:
                  </RiText>
                </RiFlexItem>
              </RiHideFor>
              <RiFlexItem grow>
                <HeaderSelect
                  options={analysisOptions}
                  valueRender={({ option }) =>
                    option.inputDisplay as JSX.Element
                  }
                  value={selectedValue ?? ''}
                  onChange={(value: string) => onChangeSelectedAnalysis(value)}
                  data-testid="select-report"
                />
              </RiFlexItem>
              {!!progress && (
                <RiFlexItem>
                  <RiText
                    className={cx(
                      styles.progress,
                      styles.text,
                      styles.progressContainer,
                    )}
                    size="s"
                    data-testid="bulk-delete-summary"
                  >
                    <RiText
                      component="span"
                      color={
                        progress.total === progress.processed
                          ? undefined
                          : 'warning'
                      }
                      className={cx(styles.progress, styles.text)}
                      size="s"
                      data-testid="analysis-progress"
                    >
                      {'Scanned '}
                      {getApproximatePercentage(
                        progress.total,
                        progress.processed,
                      )}
                    </RiText>
                    {` (${numberWithSpaces(progress.processed)}`}/
                    {numberWithSpaces(progress.total)}
                    {' keys) '}
                  </RiText>
                </RiFlexItem>
              )}
            </RiRow>
          </RiFlexItem>
        )}
        <RiFlexItem>
          <RiRow align="center">
            <RiFlexItem grow>
              <RiPrimaryButton
                aria-label="New reports"
                data-testid="start-database-analysis-btn"
                icon={CaretRightIcon}
                iconSide="left"
                disabled={analysisLoading}
                onClick={handleClick}
              >
                New Report
              </RiPrimaryButton>
            </RiFlexItem>
            <RiFlexItem style={{ paddingLeft: 6 }}>
              <RiTooltip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Database Analysis"
                data-testid="db-new-reports-tooltip"
                content={
                  connectionType === ConnectionType.Cluster
                    ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                    : ANALYZE_TOOLTIP_MESSAGE
                }
              >
                <RiIcon
                  className={styles.infoIcon}
                  type="InfoIcon"
                  size="l"
                  data-testid="db-new-reports-icon"
                />
              </RiTooltip>
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </RiRow>
    </div>
  )
}

export default Header
