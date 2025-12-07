import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
  DEFAULT_EXTRAPOLATION,
  SectionName,
} from 'uiSrc/pages/database-analysis/constants'
import {
  extrapolate,
  formatBytes,
  formatExtrapolation,
  Nullable,
} from 'uiSrc/utils'
import { BarChart } from 'uiSrc/components/charts'
import {
  BarChartData,
  BarChartDataType,
  DEFAULT_BAR_WIDTH,
  DEFAULT_MULTIPLIER_GRID,
  DEFAULT_Y_TICKS,
} from 'uiSrc/components/charts/bar-chart'
import {
  dbAnalysisReportsSelector,
  setShowNoExpiryGroup,
} from 'uiSrc/slices/analytics/dbAnalysis'
import { Title } from 'uiSrc/components/base/text/Title'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import {
  SectionTitleWrapper,
  SwitchExtrapolateResults,
} from 'uiSrc/pages/database-analysis/components/styles'
import {
  Chart,
  Container,
  Content,
  LoadingWrapper,
  Switch,
  TitleWrapper,
} from './ExpirationGroupsView.styles'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

const ExpirationGroupsView = (props: Props) => {
  const { data, loading, extrapolation, onSwitchExtrapolation } = props
  const { totalMemory, totalKeys } = data || {}

  const { showNoExpiryGroup } = useSelector(dbAnalysisReportsSelector)
  const [expirationGroups, setExpirationGroups] = useState<BarChartData[]>([])
  const [isExtrapolated, setIsExtrapolated] = useState<boolean>(true)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [extrapolation])

  useEffect(() => {
    if (!data?.expirationGroups || data?.expirationGroups?.length === 0) {
      return
    }

    const newExpirationGroups = [...(data?.expirationGroups || [])]

    // move "No expire" column to the end if should be shown
    const noExpireGroup = newExpirationGroups.shift()
    if (showNoExpiryGroup && noExpireGroup && newExpirationGroups.length > 0) {
      newExpirationGroups.push(noExpireGroup)
    }

    const extrapolationOptions = {
      apply: isExtrapolated,
      extrapolation,
      showPrefix: false,
    }

    setExpirationGroups(
      newExpirationGroups.map(({ total, threshold, label, ...group }) => ({
        ...group,
        y: extrapolate(total, extrapolationOptions) as number,
        x: threshold,
        xlabel: label,
        ylabel: '',
      })),
    )
  }, [data?.expirationGroups, showNoExpiryGroup, isExtrapolated, extrapolation])

  if (loading) {
    return <LoadingWrapper data-testid="summary-per-ttl-loading" />
  }

  const onSwitchChange = (value: boolean) => {
    dispatch(setShowNoExpiryGroup(value))
  }

  if (
    !data?.expirationGroups?.length ||
    !totalMemory?.total ||
    !totalKeys?.total
  ) {
    return null
  }

  const multiplierGrid = DEFAULT_MULTIPLIER_GRID
  const yCountTicks = DEFAULT_Y_TICKS

  return (
    <Container data-testid="analysis-ttl">
      <SectionTitleWrapper>
        <TitleWrapper>
          <Title size="M" className="section-title">
            MEMORY LIKELY TO BE FREED OVER TIME
          </Title>
          {extrapolation !== DEFAULT_EXTRAPOLATION && (
            <SwitchExtrapolateResults
              title="Extrapolate results"
              checked={isExtrapolated}
              onCheckedChange={(checked) => {
                setIsExtrapolated(checked)
                onSwitchExtrapolation?.(
                  checked,
                  SectionName.MEMORY_LIKELY_TO_BE_FREED,
                )
              }}
              data-testid="extrapolate-results"
            />
          )}
        </TitleWrapper>
        <Switch
          title={'Show "No Expiry"'}
          checked={showNoExpiryGroup}
          onCheckedChange={onSwitchChange}
          data-testid="show-no-expiry-switch"
        />
      </SectionTitleWrapper>
      <Content>
        <Chart>
          <AutoSizer>
            {({ width = 0, height = 0 }) => (
              <BarChart
                name="expiration-groups"
                width={width}
                height={height}
                dataType={BarChartDataType.Bytes}
                divideLastColumn={showNoExpiryGroup}
                multiplierGrid={multiplierGrid}
                data={expirationGroups}
                yCountTicks={yCountTicks}
                barWidth={
                  width > 1000 ? 70 : width < 800 ? 30 : DEFAULT_BAR_WIDTH
                }
                tooltipValidation={(val) =>
                  `${formatExtrapolation(formatBytes(val, 3) as string, isExtrapolated)}`
                }
                leftAxiosValidation={(val, i) =>
                  i % 2 ? '' : formatBytes(val, 1)
                }
                bottomAxiosValidation={(_val, i) =>
                  expirationGroups[i / multiplierGrid]?.xlabel
                }
              />
            )}
          </AutoSizer>
        </Chart>
      </Content>
    </Container>
  )
}

export default ExpirationGroupsView
