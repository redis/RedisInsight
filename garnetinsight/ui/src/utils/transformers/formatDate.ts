import {
  addMilliseconds,
  format as formatDateFns,
  formatDistanceToNow,
  isValid,
  isDate,
} from 'date-fns'
import { format as formatDateTZ, toZonedTime } from 'date-fns-tz'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { truncateNumberToFirstUnit } from './truncateTTL'
import { IS_NUMBER_REGEX, checkTimestamp } from '../validations'
import { Nullable } from '../types'

export const lastConnectionFormat = (date?: Date) =>
  date ? `${formatDistanceToNow(new Date(date), { addSuffix: true })}` : 'Never'

export const millisecondsFormat = (
  milliseconds: number,
  formatMask: string = 'HH:mm:ss.SSS',
) => {
  const d = new Date(0)
  return formatDateFns(
    addMilliseconds(
      new Date(milliseconds + d.getTimezoneOffset() * 1000 * 60),
      0,
    ),
    formatMask,
  )
}

export const truncateMilliseconds = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds} msec`
  }

  return truncateNumberToFirstUnit(milliseconds / 1000)
}

export const secondsToMinutes = (time: number) => {
  if (time < 60) {
    return `${time} second${time === 1 ? '' : 's'}`
  }
  const minutes = Math.floor(time / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

export const checkDateTimeFormat = (
  format: string,
  timeZone: TimezoneOption = TimezoneOption.Local,
): { valid: boolean; error: Nullable<string> } => {
  try {
    const dateString = formatDateInternal(new Date(), format, timeZone)
    return { valid: !!dateString, error: null }
  } catch (e: any) {
    return { valid: false, error: e.message }
  }
}

export const convertTimestampToMilliseconds = (value: string): number => {
  // seconds, microseconds, nanoseconds to milliseconds
  switch (parseInt(value, 10).toString().length) {
    case 10:
      return +value * 1000
    case 16:
      return +value / 1000
    case 19:
      return +value / 1000000
    default:
      return +value
  }
}

const formatDateInternal = (
  date: Date,
  format: string,
  timeZone: TimezoneOption,
) => {
  if (timeZone === TimezoneOption.Local || !timeZone) {
    return formatDateFns(date, format)
  }
  const zonedDate = toZonedTime(date, timeZone)
  return formatDateTZ(zonedDate, format, { timeZone })
}

const formatStringTimestamp = (
  value: string,
  format: string,
  timezone: TimezoneOption,
): string => {
  // check for string to be a valid value for datetime formatting
  if (!IS_NUMBER_REGEX.test(value) && isValid(new Date(value))) {
    return formatDateInternal(new Date(value), format, timezone)
  }
  if (checkTimestamp(value)) {
    const timestamp = convertTimestampToMilliseconds(value)
    return formatDateInternal(new Date(timestamp), format, timezone)
  }
  return value
}

export const formatTimestamp = (
  value: string | Date | number,
  format: string = DATETIME_FORMATTER_DEFAULT,
  timezone: TimezoneOption = TimezoneOption.Local,
): string => {
  try {
    if (isDate(value)) {
      return formatDateInternal(value, format, timezone)
    }
    return formatStringTimestamp(value.toString(), format, timezone)
  } catch (e) {
    return value.toString()
  }
}
