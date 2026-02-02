import { sumBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { DonutChart } from 'uiSrc/components/charts'
import { ChartData } from 'uiSrc/components/charts/donut-chart/DonutChart'
import { ModifiedClusterNodes } from 'uiSrc/pages/cluster-details/ClusterDetailsPage'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { getPercentage, numberWithSpaces } from 'uiSrc/utils/numbers'
import { Title } from 'uiSrc/components/base/text/Title'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './ClusterDetailsGraphics.styles'

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
    <S.LabelTooltip>
      <S.TooltipTitle>
        <span data-testid="tooltip-node-name">{data.name}: </span>
        <span data-testid="tooltip-host-port">
          {data.meta?.host}:{data.meta?.port}
        </span>
      </S.TooltipTitle>
      <b>
        <S.TooltipPercentage data-testid="tooltip-node-percent">
          {getPercentage(data.value, memorySum)}%
        </S.TooltipPercentage>
        <span data-testid="tooltip-total-memory">
          (&thinsp;{formatBytes(data.value, 3, false)}&thinsp;)
        </span>
      </b>
    </S.LabelTooltip>
  )

  const renderKeysTooltip = (data: ChartData) => (
    <S.LabelTooltip>
      <S.TooltipTitle>
        <span data-testid="tooltip-node-name">{data.name}: </span>
        <span data-testid="tooltip-host-port">
          {data.meta?.host}:{data.meta?.port}
        </span>
      </S.TooltipTitle>
      <b>
        <S.TooltipPercentage data-testid="tooltip-node-percent">
          {getPercentage(data.value, keysSum)}%
        </S.TooltipPercentage>
        <span data-testid="tooltip-total-keys">
          (&thinsp;{numberWithSpaces(data.value)}&thinsp;)
        </span>
      </b>
    </S.LabelTooltip>
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
      <S.LoadingWrapper data-testid="cluster-details-graphics-loading">
        <S.PreloaderCircle />
        <S.PreloaderCircle />
      </S.LoadingWrapper>
    )
  }

  if (!nodes || nodes.length === 0) {
    return null
  }

  return (
    <S.Wrapper data-testid="cluster-details-charts">
      <DonutChart
        name="memory"
        data={memoryData}
        renderTooltip={renderMemoryTooltip}
        labelAs="percentage"
        title={
          <S.ChartCenter>
            <S.ChartTitle data-testid="donut-title-memory">
              <S.Icon>
                <RiIcon type="MemoryIconIcon" size="m" />
              </S.Icon>
              <Title size="XS">Memory</Title>
            </S.ChartTitle>
            <S.TitleSeparator />
            <S.CenterCount>{formatBytes(memorySum, 3)}</S.CenterCount>
          </S.ChartCenter>
        }
      />
      <DonutChart
        name="keys"
        data={keysData}
        renderTooltip={renderKeysTooltip}
        labelAs="percentage"
        title={
          <S.ChartCenter>
            <S.ChartTitle data-testid="donut-title-keys">
              <S.Icon>
                <RiIcon type="KeyIconIcon" size="m" />
              </S.Icon>
              <Title size="XS">Keys</Title>
            </S.ChartTitle>
            <S.TitleSeparator />
            <S.CenterCount>{numberWithSpaces(keysSum)}</S.CenterCount>
          </S.ChartCenter>
        }
      />
    </S.Wrapper>
  )
}

export default ClusterDetailsGraphics
