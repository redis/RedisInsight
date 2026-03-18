import { faker } from '@faker-js/faker'
import { localStorageService } from 'uiSrc/services'
import BrowserStorageItem from 'uiSrc/constants/storage'
import {
  getWbTsResultPreferences,
  setWbTsResultPreferences,
  mergeWbTsChartPreferences,
  isRedisTimeSeriesVisualization,
  REDISTIMESERIES_CHART_ID,
  WorkbenchTsResultPreferences,
} from '../tsResultPreferences'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}))

const mockGet = localStorageService.get as jest.Mock
const mockSet = localStorageService.set as jest.Mock

describe('tsResultPreferences', () => {
  const instanceId = faker.string.uuid()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getWbTsResultPreferences', () => {
    it('should return undefined when storage is empty', () => {
      mockGet.mockReturnValue(null)

      expect(getWbTsResultPreferences(instanceId)).toBeUndefined()
    })

    it('should return undefined when storage has invalid JSON', () => {
      mockGet.mockReturnValue('not-an-object')

      expect(getWbTsResultPreferences(instanceId)).toBeUndefined()
    })

    it('should read from correct storage key', () => {
      mockGet.mockReturnValue(null)

      getWbTsResultPreferences(instanceId)

      expect(mockGet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + instanceId,
      )
    })

    it('should return preferences with valid selectedView', () => {
      mockGet.mockReturnValue({ selectedView: 'text' })

      const result = getWbTsResultPreferences(instanceId)

      expect(result).toEqual({ selectedView: 'text' })
    })

    it('should return default selectedView when stored value is invalid', () => {
      mockGet.mockReturnValue({
        selectedView: 'invalid',
        chartConfig: { mode: 'line' },
      })

      const result = getWbTsResultPreferences(instanceId)

      expect(result?.selectedView).toBe('plugin:redistimeseries-chart')
      expect(result?.chartConfig).toEqual({ mode: 'line' })
    })

    it('should sanitize chartConfig and ignore unknown keys', () => {
      mockGet.mockReturnValue({
        selectedView: 'text',
        chartConfig: {
          mode: 'points',
          timeUnit: 'seconds',
          staircase: true,
          fill: false,
          unknownKey: 'value',
        },
      })

      const result = getWbTsResultPreferences(instanceId)

      expect(result?.chartConfig).toEqual({
        mode: 'points',
        timeUnit: 'seconds',
        staircase: true,
        fill: false,
      })
    })

    it('should return undefined chartConfig when all chart values are invalid', () => {
      mockGet.mockReturnValue({
        selectedView: 'text',
        chartConfig: {
          mode: 'invalid',
          timeUnit: 123,
        },
      })

      const result = getWbTsResultPreferences(instanceId)

      expect(result).toEqual({ selectedView: 'text' })
    })

    it('should return undefined when no valid fields exist', () => {
      mockGet.mockReturnValue({ someOther: 'data' })

      expect(getWbTsResultPreferences(instanceId)).toBeUndefined()
    })
  })

  describe('setWbTsResultPreferences', () => {
    it('should merge with existing preferences', () => {
      mockGet.mockReturnValue({
        selectedView: 'plugin:redistimeseries-chart',
        chartConfig: { mode: 'line' },
      })

      setWbTsResultPreferences(instanceId, { selectedView: 'text' })

      expect(mockSet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + instanceId,
        {
          selectedView: 'text',
          chartConfig: { mode: 'line' },
        },
      )
    })

    it('should preserve selectedView when updating chartConfig', () => {
      mockGet.mockReturnValue({
        selectedView: 'text',
      })

      setWbTsResultPreferences(instanceId, {
        chartConfig: { fill: false },
      })

      expect(mockSet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + instanceId,
        {
          selectedView: 'text',
          chartConfig: { fill: false },
        },
      )
    })

    it('should use default selectedView when no existing preferences', () => {
      mockGet.mockReturnValue(null)

      setWbTsResultPreferences(instanceId, {
        chartConfig: { mode: 'points' },
      })

      expect(mockSet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + instanceId,
        {
          selectedView: 'plugin:redistimeseries-chart',
          chartConfig: { mode: 'points' },
        },
      )
    })

    it('should store per instanceId', () => {
      const id1 = faker.string.uuid()
      const id2 = faker.string.uuid()

      mockGet.mockReturnValue(null)

      setWbTsResultPreferences(id1, { selectedView: 'text' })
      setWbTsResultPreferences(id2, {
        selectedView: 'plugin:redistimeseries-chart',
      })

      expect(mockSet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + id1,
        expect.objectContaining({ selectedView: 'text' }),
      )
      expect(mockSet).toHaveBeenCalledWith(
        BrowserStorageItem.wbTsResultPreferences + id2,
        expect.objectContaining({
          selectedView: 'plugin:redistimeseries-chart',
        }),
      )
    })
  })

  describe('mergeWbTsChartPreferences', () => {
    it('should merge incoming chart config with existing', () => {
      mockGet.mockReturnValue({
        selectedView: 'text',
        chartConfig: { mode: 'line', fill: true },
      })

      mergeWbTsChartPreferences(instanceId, {
        mode: 'points',
        staircase: true,
      })

      expect(mockSet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          selectedView: 'text',
          chartConfig: {
            mode: 'points',
            fill: true,
            staircase: true,
          },
        }),
      )
    })

    it('should ignore unsupported keys from incoming state', () => {
      mockGet.mockReturnValue({ selectedView: 'text' })

      mergeWbTsChartPreferences(instanceId, {
        mode: 'line',
        title: 'My Chart',
        xlabel: 'X',
      })

      const writtenValue = mockSet.mock
        .calls[0][1] as WorkbenchTsResultPreferences

      expect(writtenValue.chartConfig?.mode).toBe('line')
      expect((writtenValue.chartConfig as any)?.title).toBeUndefined()
    })

    it('should not write when incoming state has no valid chart fields', () => {
      mockGet.mockReturnValue(null)

      mergeWbTsChartPreferences(instanceId, {
        title: 'something',
        xlabel: 'x',
      })

      expect(mockSet).not.toHaveBeenCalled()
    })

    it('should not overwrite selectedView', () => {
      mockGet.mockReturnValue({ selectedView: 'text' })

      mergeWbTsChartPreferences(instanceId, { mode: 'points' })

      const writtenValue = mockSet.mock
        .calls[0][1] as WorkbenchTsResultPreferences

      expect(writtenValue.selectedView).toBe('text')
    })
  })

  describe('isRedisTimeSeriesVisualization', () => {
    it('should return true for redistimeseries-chart', () => {
      expect(isRedisTimeSeriesVisualization(REDISTIMESERIES_CHART_ID)).toBe(
        true,
      )
    })

    it('should return false for other ids', () => {
      expect(isRedisTimeSeriesVisualization('some-other-plugin')).toBe(false)
    })
  })
})
