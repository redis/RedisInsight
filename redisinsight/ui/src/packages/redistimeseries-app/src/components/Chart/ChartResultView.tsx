import React, { useCallback, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - local workspace package resolved by Vite at build time
import { setState as setPluginState } from 'redisinsight-plugin-sdk'
import {
  AxisScale,
  ChartConfig,
  GraphMode,
  PersistedTsChartConfig,
  TimeSeries,
  TimeUnit,
  YAxisConfig,
} from './interfaces'
import ChartConfigForm from './ChartConfigForm'
import Chart from './Chart'
import { determineDefaultTimeUnits, normalizeDatapointUnits } from './utils'

enum LAYOUT_STATE {
  INITIAL_STATE,
  RELAYOUT_STATE,
}

interface ChartResultViewProps {
  data: TimeSeries[]
  initialChartConfig?: PersistedTsChartConfig
}

const PERSISTED_FIELDS = ['mode', 'timeUnit', 'staircase', 'fill'] as const

const extractPersistedSubset = (config: ChartConfig): PersistedTsChartConfig => ({
  mode: config.mode,
  timeUnit: config.timeUnit,
  staircase: config.staircase,
  fill: config.fill,
})

const emitPersistedState = (config: ChartConfig) => {
  setPluginState(extractPersistedSubset(config)).catch(() => {})
}

export default function ChartResultView(props: ChartResultViewProps) {
  const { initialChartConfig } = props
  const defaultYAxisConfig: YAxisConfig = { label: '', scale: AxisScale.linear }
  const keyToY2AxisDefault = props.data.reduce(
    (keyToYAxis: any, timeSeries) => {
      keyToYAxis[timeSeries.key] = false
      return keyToYAxis
    },
    {},
  )

  const resolvedMode = initialChartConfig?.mode
    ? (initialChartConfig.mode as GraphMode)
    : GraphMode.line

  const resolvedTimeUnit = initialChartConfig?.timeUnit
    ? (initialChartConfig.timeUnit as TimeUnit)
    : determineDefaultTimeUnits(props.data)

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    mode: resolvedMode,
    timeUnit: resolvedTimeUnit,
    title: '',
    xlabel: '',
    staircase: initialChartConfig?.staircase ?? false,
    fill: initialChartConfig?.fill ?? true,
    yAxis2: false,
    keyToY2Axis: keyToY2AxisDefault,
    yAxisConfig: defaultYAxisConfig,
    yAxis2Config: defaultYAxisConfig,
  })
  const [chartState, setChartState] = useState<LAYOUT_STATE>(
    LAYOUT_STATE.INITIAL_STATE,
  )

  const prevPersistedRef = useRef(extractPersistedSubset(chartConfig))

  const emitIfPersistedChanged = useCallback((next: ChartConfig) => {
    const nextSubset = extractPersistedSubset(next)
    const prev = prevPersistedRef.current

    const changed = PERSISTED_FIELDS.some((f) => nextSubset[f] !== prev[f])
    if (changed) {
      prevPersistedRef.current = nextSubset
      emitPersistedState(next)
    }
  }, [])

  function handleChartConfigChanged(control: string, value: any) {
    const next = { ...chartConfig, [control]: value }
    setChartConfig(next)
    emitIfPersistedChanged(next)
    if (chartState !== LAYOUT_STATE.INITIAL_STATE) {
      setChartState(LAYOUT_STATE.INITIAL_STATE)
    }
  }

  function onRelayout() {
    if (chartState !== LAYOUT_STATE.RELAYOUT_STATE) {
      setChartState(LAYOUT_STATE.RELAYOUT_STATE)
    }
  }

  function onDoubleClick() {
    if (chartState !== LAYOUT_STATE.INITIAL_STATE) {
      setChartState(LAYOUT_STATE.INITIAL_STATE)
    }
  }

  const memoizedChartData = useMemo(
    () => normalizeDatapointUnits(props.data, chartConfig.timeUnit),
    [props.data, chartConfig.timeUnit],
  )

  return (
    <div>
      <div className="zoom-helper-text">
        <i>
          {chartState === LAYOUT_STATE.INITIAL_STATE
            ? 'Drag over the part of the chart to zoom into it'
            : 'Double click on the graph to reset the view'}
        </i>
      </div>
      <Chart
        chartConfig={chartConfig}
        data={memoizedChartData}
        onRelayout={onRelayout}
        onDoubleClick={onDoubleClick}
      />
      <div className="config-form-wrapper">
        <ChartConfigForm
          value={chartConfig}
          onChange={handleChartConfigChanged}
        />
      </div>
    </div>
  )
}
