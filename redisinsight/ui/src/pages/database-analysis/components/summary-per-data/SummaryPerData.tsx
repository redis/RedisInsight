import cx from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'

import { RiSwitchInput } from 'uiBase/inputs'
import { RiTitle } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import { DonutChart } from 'uiSrc/components/charts'
import { ChartData } from 'uiSrc/components/charts/donut-chart/DonutChart'
import { GROUP_TYPES_COLORS, GroupTypesColors } from 'uiSrc/constants'
import {
  DEFAULT_EXTRAPOLATION,
  SectionName,
} from 'uiSrc/pages/database-analysis'
import {
  extrapolate,
  formatBytes,
  getGroupTypeDisplay,
  Nullable,
} from 'uiSrc/utils'
import { getPercentage, numberWithSpaces } from 'uiSrc/utils/numbers'

import {
  DatabaseAnalysis,
  SimpleTypeSummary,
} from 'apiSrc/modules/database-analysis/models'

import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation?: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

const widthResponsiveSize = 1024
const CHART_WITH_LABELS_WIDTH = 432
const CHART_WIDTH = 320

const SummaryPerData = ({
  data,
  loading,
  extrapolation,
  onSwitchExtrapolation,
}: Props) => {
  const { totalMemory, totalKeys } = data || {}
  const [memoryData, setMemoryData] = useState<ChartData[]>([])
  const [keysData, setKeysData] = useState<ChartData[]>([])
  const [isExtrapolated, setIsExtrapolated] = useState<boolean>(true)
  const [hideLabelTitle, setHideLabelTitle] = useState(false)

  const getChartData = (t: SimpleTypeSummary) => ({
    value: t.total,
    name: getGroupTypeDisplay(t.type),
    color:
      t.type in GROUP_TYPES_COLORS
        ? GROUP_TYPES_COLORS[t.type as GroupTypesColors]
        : 'var(--defaultTypeColor)',
    meta: { ...t },
  })

  const updateChartSize = () => {
    setHideLabelTitle(globalThis.innerWidth < widthResponsiveSize)
  }

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [data, extrapolation])

  useEffect(() => {
    updateChartSize()
    globalThis.addEventListener('resize', updateChartSize)
    return () => {
      globalThis.removeEventListener('resize', updateChartSize)
    }
  }, [])

  useEffect(() => {
    if (data && totalMemory && totalKeys) {
      setMemoryData(totalMemory.types?.map(getChartData) as ChartData[])
      setKeysData(totalKeys.types?.map(getChartData) as ChartData[])
    }
  }, [data])

  const renderMemoryTooltip = useCallback(
    ({ value, name }: ChartData) => (
      <div className={styles.labelTooltip} data-testid="tooltip-memory">
        <b>
          <span
            className={styles.tooltipKeyType}
            data-testid="tooltip-key-type"
          >
            {name}:{' '}
          </span>
          <span
            className={styles.tooltipPercentage}
            data-testid="tooltip-key-percent"
          >
            {getPercentage(value, totalMemory?.total)}%
          </span>
          <span data-testid="tooltip-total-memory">
            (&thinsp;
            {extrapolate(
              value,
              { extrapolation, apply: isExtrapolated },
              (val: number) => formatBytes(val, 3, false) as string,
            )}
            &thinsp;)
          </span>
        </b>
      </div>
    ),
    [totalMemory, extrapolation, isExtrapolated],
  )

  const renderKeysTooltip = useCallback(
    ({ name, value }: ChartData) => (
      <div className={styles.labelTooltip} data-testid="tooltip-keys">
        <b>
          <span
            className={styles.tooltipKeyType}
            data-testid="tooltip-key-type"
          >
            {name}:{' '}
          </span>
          <span
            className={styles.tooltipPercentage}
            data-testid="tooltip-key-percent"
          >
            {getPercentage(value, totalKeys?.total)}%
          </span>
          <span data-testid="tooltip-total-keys">
            (&thinsp;
            {extrapolate(
              value,
              { extrapolation, apply: isExtrapolated },
              (val: number) => numberWithSpaces(Math.round(val)),
            )}
            &thinsp;)
          </span>
        </b>
      </div>
    ),
    [totalKeys, extrapolation, isExtrapolated],
  )

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div
          className={cx(styles.chartsWrapper, styles.loadingWrapper)}
          data-testid="summary-per-data-loading"
        >
          <div className={styles.preloaderCircle} />
          <div className={styles.preloaderCircle} />
        </div>
      </div>
    )
  }

  if (
    (!totalMemory || memoryData.length === 0) &&
    (!totalKeys || keysData.length === 0)
  ) {
    return null
  }

  return (
    <div
      className={cx('section', styles.wrapper)}
      data-testid="summary-per-data"
    >
      <div className="section-title-wrapper">
        <RiTitle size="M" className="section-title">
          SUMMARY PER DATA TYPE
        </RiTitle>
        {extrapolation !== DEFAULT_EXTRAPOLATION && (
          <RiSwitchInput
            color="subdued"
            className="switch-extrapolate-results"
            title="Extrapolate results"
            checked={isExtrapolated}
            onCheckedChange={(checked) => {
              setIsExtrapolated(checked)
              onSwitchExtrapolation?.(checked, SectionName.SUMMARY_PER_DATA)
            }}
            data-testid="extrapolate-results"
          />
        )}
      </div>
      <div
        className={cx('section-content', styles.chartsWrapper)}
        data-testid="summary-per-data-charts"
      >
        <DonutChart
          name="memory"
          data={memoryData}
          labelAs="percentage"
          hideLabelTitle={hideLabelTitle}
          width={hideLabelTitle ? CHART_WIDTH : CHART_WITH_LABELS_WIDTH}
          config={{ radius: 94 }}
          renderTooltip={renderMemoryTooltip}
          title={
            <div className={styles.chartCenter}>
              <div
                className={styles.chartTitle}
                data-testid="donut-title-memory"
              >
                <RiIcon
                  type="MemoryIconIcon"
                  className={styles.icon}
                  size="m"
                />
                <RiTitle size="XS">Memory</RiTitle>
              </div>
              <hr className={styles.titleSeparator} />
              <div
                className={styles.centerCount}
                data-testid="total-memory-value"
              >
                {extrapolate(
                  totalMemory?.total || 0,
                  { extrapolation, apply: isExtrapolated },
                  (val: number) => formatBytes(val || 0, 3) as string,
                )}
              </div>
            </div>
          }
        />
        <DonutChart
          name="keys"
          data={keysData}
          labelAs="percentage"
          hideLabelTitle={hideLabelTitle}
          width={hideLabelTitle ? CHART_WIDTH : CHART_WITH_LABELS_WIDTH}
          config={{ radius: 94 }}
          renderTooltip={renderKeysTooltip}
          title={
            <div className={styles.chartCenter}>
              <div className={styles.chartTitle} data-testid="donut-title-keys">
                <RiIcon type="KeyIconIcon" className={styles.icon} size="m" />
                <RiTitle size="XS">Keys</RiTitle>
              </div>
              <hr className={styles.titleSeparator} />
              <div
                className={styles.centerCount}
                data-testid="total-keys-value"
              >
                {extrapolate(
                  totalKeys?.total || 0,
                  { extrapolation, apply: isExtrapolated },
                  (val: number) =>
                    numberWithSpaces(Math.round(val) || 0) as string,
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}

export default SummaryPerData
