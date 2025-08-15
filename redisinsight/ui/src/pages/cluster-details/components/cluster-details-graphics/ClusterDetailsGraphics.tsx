import cx from 'classnames'
import { sumBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { RiTitle } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import { DonutChart } from 'uiSrc/components/charts'
import { ChartData } from 'uiSrc/components/charts/donut-chart/DonutChart'
import { ModifiedClusterNodes } from 'uiSrc/pages/cluster-details/ClusterDetailsPage'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { getPercentage, numberWithSpaces } from 'uiSrc/utils/numbers'
import styles from './styles.module.scss'

const ClusterDetailsGraphics = ({
  nodes,
  loading,
}: {
  nodes: Nullable<ModifiedClusterNodes[]>
  loading: boolean
}) => {
  const [memoryData, setMemoryData] = useState<ChartData[]>([])
  const [memorySum, setMemorySum] = useState(0)
  const [keysData, setKeysData] = useState<ChartData[]>([])
  const [keysSum, setKeysSum] = useState(0)

  const renderMemoryTooltip = (data: ChartData) => (
    <div className={styles.labelTooltip}>
      <div className={styles.tooltipTitle}>
        <span data-testid="tooltip-node-name">{data.name}: </span>
        <span data-testid="tooltip-host-port">
          {data.meta?.host}:{data.meta?.port}
        </span>
      </div>
      <b>
        <span
          className={styles.tooltipPercentage}
          data-testid="tooltip-node-percent"
        >
          {getPercentage(data.value, memorySum)}%
        </span>
        <span data-testid="tooltip-total-memory">
          (&thinsp;{formatBytes(data.value, 3, false)}&thinsp;)
        </span>
      </b>
    </div>
  )

  const renderKeysTooltip = (data: ChartData) => (
    <div className={styles.labelTooltip}>
      <div className={styles.tooltipTitle}>
        <span data-testid="tooltip-node-name">{data.name}: </span>
        <span data-testid="tooltip-host-port">
          {data.meta?.host}:{data.meta?.port}
        </span>
      </div>
      <b>
        <span
          className={styles.tooltipPercentage}
          data-testid="tooltip-node-percent"
        >
          {getPercentage(data.value, keysSum)}%
        </span>
        <span data-testid="tooltip-total-keys">
          (&thinsp;{numberWithSpaces(data.value)}&thinsp;)
        </span>
      </b>
    </div>
  )

  useEffect(() => {
    if (nodes) {
      const memory = nodes.map((n) => ({
        value: n.usedMemory,
        name: n.letter,
        color: n.color,
        meta: { ...n },
      }))
      const keys = nodes.map((n) => ({
        value: n.totalKeys,
        name: n.letter,
        color: n.color,
        meta: { ...n },
      }))

      setMemoryData(memory as ChartData[])
      setKeysData(keys as ChartData[])

      setMemorySum(sumBy(memory, 'value'))
      setKeysSum(sumBy(keys, 'value'))
    }
  }, [nodes])

  if (loading && !nodes?.length) {
    return (
      <div
        className={cx(styles.wrapper, styles.loadingWrapper)}
        data-testid="cluster-details-graphics-loading"
      >
        <div className={styles.preloaderCircle} />
        <div className={styles.preloaderCircle} />
      </div>
    )
  }

  if (!nodes || nodes.length === 0) {
    return null
  }

  return (
    <div className={styles.wrapper} data-testid="cluster-details-charts">
      <DonutChart
        name="memory"
        data={memoryData}
        renderTooltip={renderMemoryTooltip}
        labelAs="percentage"
        title={
          <div className={styles.chartCenter}>
            <div className={styles.chartTitle} data-testid="donut-title-memory">
              <RiIcon type="MemoryIconIcon" className={styles.icon} size="m" />
              <RiTitle size="XS">Memory</RiTitle>
            </div>
            <hr className={styles.titleSeparator} />
            <div className={styles.centerCount}>
              {formatBytes(memorySum, 3)}
            </div>
          </div>
        }
      />
      <DonutChart
        name="keys"
        data={keysData}
        renderTooltip={renderKeysTooltip}
        labelAs="percentage"
        title={
          <div className={styles.chartCenter}>
            <div className={styles.chartTitle} data-testid="donut-title-keys">
              <RiIcon type="KeyIconIcon" className={styles.icon} size="m" />
              <RiTitle size="XS">Keys</RiTitle>
            </div>
            <hr className={styles.titleSeparator} />
            <div className={styles.centerCount}>
              {numberWithSpaces(keysSum)}
            </div>
          </div>
        }
      />
    </div>
  )
}

export default ClusterDetailsGraphics
