export enum DurationUnits {
  microSeconds = 'µs',
  milliSeconds = 'ms',
  mSeconds = 'msec',
}

export const DURATION_UNITS = [
  {
    inputDisplay: DurationUnits.microSeconds,
    value: DurationUnits.microSeconds,
    'data-test-subj': 'unit-micro-second',
  },
  {
    inputDisplay: 'msec',
    value: DurationUnits.milliSeconds,
    'data-test-subj': 'unit-milli-second',
  },
]

export const MINUS_ONE = -1
export const DEFAULT_SLOWLOG_MAX_LEN = 128
export const DEFAULT_SLOWLOG_SLOWER_THAN = 10
export const DEFAULT_SLOWLOG_DURATION_UNIT = DurationUnits.milliSeconds

export const TOOLTIP_DELAY_LONG = 500 // ms

export default DURATION_UNITS
