import { isObjectLike } from 'lodash'

import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'

export interface PersistedTsChartConfig {
  mode?: 'line' | 'points'
  timeUnit?: 'seconds' | 'milliseconds'
  staircase?: boolean
  fill?: boolean
}

export interface WorkbenchTsResultPreferences {
  selectedView: 'text' | 'plugin:redistimeseries-chart'
  chartConfig?: PersistedTsChartConfig
}

const VALID_MODES = ['line', 'points'] as const
const VALID_TIME_UNITS = ['seconds', 'milliseconds'] as const
const VALID_SELECTED_VIEWS = ['text', 'plugin:redistimeseries-chart'] as const

const REDISTIMESERIES_PLUGIN_NAME = 'redistimeseries'
const REDISTIMESERIES_VIEW_ID = 'redistimeseries-chart'
const REDISTIMESERIES_CHART_ID = `${REDISTIMESERIES_PLUGIN_NAME}__${REDISTIMESERIES_VIEW_ID}`

const isValidMode = (v: unknown): v is PersistedTsChartConfig['mode'] =>
  VALID_MODES.includes(v as any)

const isValidTimeUnit = (v: unknown): v is PersistedTsChartConfig['timeUnit'] =>
  VALID_TIME_UNITS.includes(v as any)

const isValidSelectedView = (
  v: unknown,
): v is WorkbenchTsResultPreferences['selectedView'] =>
  VALID_SELECTED_VIEWS.includes(v as any)

const sanitizeChartConfig = (
  raw: unknown,
): PersistedTsChartConfig | undefined => {
  if (!isObjectLike(raw)) return undefined

  const obj = raw as Record<string, unknown>
  const result: PersistedTsChartConfig = {}

  if (isValidMode(obj.mode)) result.mode = obj.mode
  if (isValidTimeUnit(obj.timeUnit)) result.timeUnit = obj.timeUnit
  if (typeof obj.staircase === 'boolean') result.staircase = obj.staircase
  if (typeof obj.fill === 'boolean') result.fill = obj.fill

  return Object.keys(result).length > 0 ? result : undefined
}

const storageKey = (instanceId: string) =>
  BrowserStorageItem.wbTsResultPreferences + instanceId

export const getWbTsResultPreferences = (
  instanceId: string,
): WorkbenchTsResultPreferences | undefined => {
  try {
    const raw = localStorageService.get(storageKey(instanceId))

    if (!isObjectLike(raw)) return undefined

    const selectedView = isValidSelectedView(raw.selectedView)
      ? raw.selectedView
      : undefined

    const chartConfig = sanitizeChartConfig(raw.chartConfig)

    if (!selectedView && !chartConfig) return undefined

    return {
      selectedView: selectedView ?? 'plugin:redistimeseries-chart',
      ...(chartConfig ? { chartConfig } : {}),
    }
  } catch {
    return undefined
  }
}

export const setWbTsResultPreferences = (
  instanceId: string,
  preferences: Partial<WorkbenchTsResultPreferences>,
): void => {
  try {
    const existing = getWbTsResultPreferences(instanceId)
    const merged: WorkbenchTsResultPreferences = {
      selectedView: existing?.selectedView ?? 'plugin:redistimeseries-chart',
      chartConfig: existing?.chartConfig,
      ...preferences,
    }
    localStorageService.set(storageKey(instanceId), merged)
  } catch {
    // silently fail
  }
}

export const mergeWbTsChartPreferences = (
  instanceId: string,
  incoming: Record<string, unknown>,
): void => {
  const filtered = sanitizeChartConfig(incoming)
  if (!filtered) return

  const existing = getWbTsResultPreferences(instanceId)
  setWbTsResultPreferences(instanceId, {
    chartConfig: { ...existing?.chartConfig, ...filtered },
  })
}

export const isRedisTimeSeriesVisualization = (
  visualizationId: string,
): boolean => visualizationId === REDISTIMESERIES_CHART_ID

export { REDISTIMESERIES_CHART_ID }
