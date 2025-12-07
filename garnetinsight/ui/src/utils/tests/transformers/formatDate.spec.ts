import { format } from 'date-fns'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import {
  checkDateTimeFormat,
  formatTimestamp,
  secondsToMinutes,
} from 'uiSrc/utils'

const defaultValue = new Date('2023-10-05T12:34:56Z')
const defaultFormat = DATETIME_FORMATTER_DEFAULT
const defaultTimezone = 'UTC'

const secondsToMinutesTests: any[] = [
  [0, '0 seconds'],
  [1, '1 second'],
  [25, '25 seconds'],
  [60, '1 minute'],
  [65, '1 minute'],
  [120, '2 minutes'],
  [1300, '21 minutes'],
]

const checkDateTimeFormatTests: any[] = [
  ['yyyy-MM-dd', true],
  ['invalid-format', false],
]

const formatTimestampTests: any[] = [
  {
    // valid date, format, local timezone
    timezone: 'local',
    expect: format(defaultValue, defaultFormat),
  },
  {
    // invalid date, valid format, local timezone
    value: 'invalid date',
    timezone: 'local',
    expect: 'invalid date',
  },
  {
    // valid date, valid format, time utc
    format: 'yyyy-MM-dd HH:mm:ss',
    expect: '2023-10-05 12:34:56',
  },
  // invalid date, valid format,time utc
  {
    value: 'invalid date',
    expect: 'invalid date',
  },
  {
    // valid date, INvalid format, time utc
    format: 'invalid format',
    expect: defaultValue.toString(),
  },
  {
    // valid date, valid format, invalid timezone
    timezone: 'invalid timezone',
    expect: defaultValue.toString(),
  },
  // timezone check
  {
    // in UTC+ format not working
    timezone: 'UTC+14:00',
    expect: defaultValue.toString(),
  },
]

describe('secondsToMinutes', () => {
  it.each(secondsToMinutesTests)(
    'should be output: %s, for value: $s',
    (input, output) => {
      const result = secondsToMinutes(input)
      expect(result).toBe(output)
    },
  )
})

describe('checkDateTimeFormat', () => {
  it.each(checkDateTimeFormatTests)(
    'should be output: %s, for value: $s',
    (input, output) => {
      const result = checkDateTimeFormat(input)
      const resultUTC = checkDateTimeFormat(input, TimezoneOption.UTC)
      expect(result.valid).toBe(output)
      expect(resultUTC.valid).toBe(output)
    },
  )
})

describe('formatTimestamp', () => {
  it.each(formatTimestampTests)(
    'should be output: %s, for value: $s',
    (testcase) => {
      const value = testcase.value || defaultValue
      const format = testcase.format || defaultFormat
      const timezone = testcase.timezone || defaultTimezone
      const result = formatTimestamp(value, format, timezone)
      expect(result).toBe(testcase.expect)
    },
  )
})
