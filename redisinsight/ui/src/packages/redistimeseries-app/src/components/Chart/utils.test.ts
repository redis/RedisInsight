import { hexToRGBA, normalizeDatapointUnits, determineDefaultTimeUnits } from './utils'
import { TimeSeries, TimeUnit } from './interfaces'

const hexToRGBATests: [string, string][] = [
  ['#fbafff', 'rgb(251, 175, 255)'],
  ['#af087b', 'rgb(175, 8, 123)'],
  ['#0088ff', 'rgb(0, 136, 255)'],
  ['#123456', 'rgb(18, 52, 86)'],
  ['#FF0000', 'rgb(255, 0, 0)'],
  ['#345465', 'rgb(52, 84, 101)'],
]

describe('hexToRGBA', () => {
  it.each(hexToRGBATests)(
    'for input hex: %s, should be output: %s',
    (hex, expected) => {
      const result = hexToRGBA(hex, 0)
      expect(result).toBe(expected)
    },
  )
})


const normalizeDatapointUnitsTests: [TimeSeries[], TimeUnit, TimeSeries[]][] = [
  // Test with seconds - should multiply timestamps by 1000
  [
    [
      {
        key: 'test-key-1',
        labels: { app: 'redis' },
        datapoints: [[1690000000, 'value1'], [1690000001, 'value2']]
      }
    ],
    TimeUnit.seconds,
    [
      {
        key: 'test-key-1',
        labels: { app: 'redis' },
        datapoints: [[1690000000000, 'value1'], [1690000001000, 'value2']]
      }
    ]
  ],
  // Test with milliseconds - should return unchanged
  [
    [
      {
        key: 'test-key-2',
        labels: { service: 'cache' },
        datapoints: [[1690000000000, 'value1'], [1690000001000, 'value2']]
      }
    ],
    TimeUnit.milliseconds,
    [
      {
        key: 'test-key-2',
        labels: { service: 'cache' },
        datapoints: [[1690000000000, 'value1'], [1690000001000, 'value2']]
      }
    ]
  ],
  // Test with multiple time series and seconds
  [
    [
      {
        key: 'series-1',
        labels: { type: 'memory' },
        datapoints: [[1690000000, 'mem1'], [1690000002, 'mem2']]
      },
      {
        key: 'series-2',
        labels: { type: 'cpu' },
        datapoints: [[1690000001, 'cpu1'], [1690000003, 'cpu2']]
      }
    ],
    TimeUnit.seconds,
    [
      {
        key: 'series-1',
        labels: { type: 'memory' },
        datapoints: [[1690000000000, 'mem1'], [1690000002000, 'mem2']]
      },
      {
        key: 'series-2',
        labels: { type: 'cpu' },
        datapoints: [[1690000001000, 'cpu1'], [1690000003000, 'cpu2']]
      }
    ]
  ],
  // Test with empty datapoints
  [
    [
      {
        key: 'empty-series',
        labels: {},
        datapoints: []
      }
    ],
    TimeUnit.seconds,
    [
      {
        key: 'empty-series',
        labels: {},
        datapoints: []
      }
    ]
  ]
]

describe('normalizeDatapointUnits', () => {
  it.each(normalizeDatapointUnitsTests)(
    'should normalize datapoint units for input: %j with unit: %s',
    (timeSeries, unit, expected) => {
      const result = normalizeDatapointUnits(timeSeries, unit)
      expect(result).toEqual(expected)
    },
  )

  it('should return original data when an error occurs', () => {
    // Create a scenario that might cause an error by passing invalid data
    const invalidTimeSeries = null as any
    const result = normalizeDatapointUnits(invalidTimeSeries, TimeUnit.seconds)
    
    expect(result).toBe(invalidTimeSeries)
  })
})

const determineDefaultTimeUnitsTests: [TimeSeries[], TimeUnit][] = [
  // Test with timestamp in milliseconds (> 1e10)
  [
    [
      {
        key: 'test-key-1',
        labels: { app: 'redis' },
        datapoints: [[1690000000000, 'value1']]
      }
    ],
    TimeUnit.milliseconds
  ],
  // Test with timestamp in seconds (< 1e10)
  [
    [
      {
        key: 'test-key-2',
        labels: { app: 'redis' },
        datapoints: [[1690000000, 'value1']]
      }
    ],
    TimeUnit.seconds
  ],
  // Test with exactly 1e10 (boundary case - should be seconds)
  [
    [
      {
        key: 'boundary-key',
        labels: { type: 'boundary' },
        datapoints: [[1e10, 'boundary-value']]
      }
    ],
    TimeUnit.seconds
  ],
  // Test with timestamp much larger than 1e10
  [
    [
      {
        key: 'large-timestamp',
        labels: { type: 'large' },
        datapoints: [[1690000000000000, 'large-value']]
      }
    ],
    TimeUnit.milliseconds
  ],
  // Test with multiple time series - should use first one
  [
    [
      {
        key: 'first-series',
        labels: { order: 'first' },
        datapoints: [[1690000000000, 'first-value']]
      },
      {
        key: 'second-series',
        labels: { order: 'second' },
        datapoints: [[1690000000, 'second-value']]
      }
    ],
    TimeUnit.milliseconds
  ]
]

describe('determineDefaultTimeUnits', () => {
  it.each(determineDefaultTimeUnitsTests)(
    'should determine time unit for input: %j to be: %s',
    (timeSeries, expected) => {
      const result = determineDefaultTimeUnits(timeSeries)
      expect(result).toBe(expected)
    },
  )

  it('should return seconds for empty or invalid data', () => {
    expect(determineDefaultTimeUnits([])).toBe(TimeUnit.seconds)
    expect(determineDefaultTimeUnits(null as any)).toBe(TimeUnit.seconds)
    expect(determineDefaultTimeUnits(undefined as any)).toBe(TimeUnit.seconds)
  })

  it('should return seconds for time series with no datapoints', () => {
    const timeSeries: TimeSeries[] = [
      {
        key: 'empty-datapoints',
        labels: {},
        datapoints: []
      }
    ]
    expect(determineDefaultTimeUnits(timeSeries)).toBe(TimeUnit.seconds)
  })
})
