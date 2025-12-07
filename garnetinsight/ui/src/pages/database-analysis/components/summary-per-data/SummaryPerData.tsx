import React, { useCallback, useEffect, useState } from 'react'

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
import { Title } from 'uiSrc/components/base/text/Title'
import { RiIcon, AllIconsType } from 'uiSrc/components/base/icons/RiIcon'
import {
  DatabaseAnalysis,
  SimpleTypeSummary,
} from 'apiSrc/modules/database-analysis/models'

import {
  ChartsWrapper,
  LabelTooltip,
  PreloaderCircle,
  TitleSeparator,
  TooltipPercentage,
  Wrapper,
} from './SummaryPerData.styles'
import {
  Section,
  SectionTitleWrapper,
  SwitchExtrapolateResults,
} from 'uiSrc/pages/database-analysis/components/styles'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation?: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

interface DonutChartTitleProps {
  icon: AllIconsType
  title: string
  value: string | number
  testId: string
}

const DonutChartTitle = ({
  icon,
  title,
  value,
  testId,
}: DonutChartTitleProps) => (
  <Col align="center" grow={false} gap="xs">
    <Row align="center" gap="m" data-testid={`donut-title-${testId}`}>
      <RiIcon type={icon} size="m" />
      <Title size="XS">{title}</Title>
    </Row>
    <TitleSeparator />
    <Text
      component="div"
      variant="semiBold"
      data-testid={`total-${testId}-value`}
    >
      {String(value)}
    </Text>
  </Col>
)

const widthResponsiveSize = 1024
const CHART_WITH_LABELS_WIDTH = 432
const CHART_WIDTH = 320
const getChartData = (t: SimpleTypeSummary): ChartData => ({
  value: t.total,
  name: getGroupTypeDisplay(t.type),
  color:
    t.type in GROUP_TYPES_COLORS
      ? GROUP_TYPES_COLORS[t.type as GroupTypesColors]
      : 'var(--defaultTypeColor)',
  meta: { ...t },
})

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
      setMemoryData(totalMemory.types?.map(getChartData))
      setKeysData(totalKeys.types?.map(getChartData))
    }
  }, [data])

  const renderMemoryTooltip = useCallback(
    ({ value, name }: ChartData) => (
      <LabelTooltip data-testid="tooltip-memory">
        <span data-testid="tooltip-key-type">{name}: </span>
        <TooltipPercentage data-testid="tooltip-key-percent">
          {getPercentage(value, totalMemory?.total)}%
        </TooltipPercentage>
        <span data-testid="tooltip-total-memory">
          (&thinsp;
          {extrapolate(
            value,
            { extrapolation, apply: isExtrapolated },
            (val: number) => formatBytes(val, 3, false) as string,
          )}
          &thinsp;)
        </span>
      </LabelTooltip>
    ),
    [totalMemory, extrapolation, isExtrapolated],
  )

  const renderKeysTooltip = useCallback(
    ({ name, value }: ChartData) => (
      <LabelTooltip data-testid="tooltip-keys">
        <span data-testid="tooltip-key-type">{name}: </span>
        <TooltipPercentage data-testid="tooltip-key-percent">
          {getPercentage(value, totalKeys?.total)}%
        </TooltipPercentage>
        <span data-testid="tooltip-total-keys">
          (&thinsp;
          {extrapolate(
            value,
            { extrapolation, apply: isExtrapolated },
            (val: number) => numberWithSpaces(Math.round(val)),
          )}
          &thinsp;)
        </span>
      </LabelTooltip>
    ),
    [totalKeys, extrapolation, isExtrapolated],
  )

  if (loading) {
    return (
      <Wrapper>
        <ChartsWrapper $isLoading data-testid="summary-per-data-loading">
          <PreloaderCircle />
          <PreloaderCircle />
        </ChartsWrapper>
      </Wrapper>
    )
  }

  if (
    (!totalMemory || memoryData.length === 0) &&
    (!totalKeys || keysData.length === 0)
  ) {
    return null
  }

  return (
    <Section data-testid="summary-per-data">
      <SectionTitleWrapper>
        <Title size="M">SUMMARY PER DATA TYPE</Title>
        {extrapolation !== DEFAULT_EXTRAPOLATION && (
          <SwitchExtrapolateResults
            title="Extrapolate results"
            checked={isExtrapolated}
            onCheckedChange={(checked) => {
              setIsExtrapolated(checked)
              onSwitchExtrapolation?.(checked, SectionName.SUMMARY_PER_DATA)
            }}
            data-testid="extrapolate-results"
          />
        )}
      </SectionTitleWrapper>
      <ChartsWrapper $isSection data-testid="summary-per-data-charts">
        <DonutChart
          name="memory"
          data={memoryData}
          labelAs="percentage"
          hideLabelTitle={hideLabelTitle}
          width={hideLabelTitle ? CHART_WIDTH : CHART_WITH_LABELS_WIDTH}
          config={{ radius: 94 }}
          renderTooltip={renderMemoryTooltip}
          title={
            <DonutChartTitle
              icon="MemoryIconIcon"
              title="Memory"
              testId="memory"
              value={extrapolate(
                totalMemory?.total || 0,
                { extrapolation, apply: isExtrapolated },
                (val: number) => formatBytes(val || 0, 3) as string,
              )}
            />
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
            <DonutChartTitle
              icon="KeyIconIcon"
              title="Keys"
              testId="keys"
              value={extrapolate(
                totalKeys?.total || 0,
                { extrapolation, apply: isExtrapolated },
                (val: number) =>
                  numberWithSpaces(Math.round(val) || 0) as string,
              )}
            />
          }
        />
      </ChartsWrapper>
    </Section>
  )
}

export default SummaryPerData
