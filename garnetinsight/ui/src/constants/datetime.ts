import { DATETIME_FORMATTER_DEFAULT } from './keys'

export const dateTimeOptions = [
  {
    inputDisplay: DATETIME_FORMATTER_DEFAULT,
    value: DATETIME_FORMATTER_DEFAULT,
  },
  { inputDisplay: 'yyyy-MM-dd HH:mm:ss.sss', value: 'yyyy-MM-dd HH:mm:ss.sss' },
  {
    inputDisplay: 'dd-MMM-yyyy HH:mm:ss.SSS',
    value: 'dd-MMM-yyyy HH:mm:ss.SSS',
  },
  { inputDisplay: 'dd.MM.yyyy HH:mm:ss', value: 'dd.MM.yyyy HH:mm:ss' },
]

export enum TimezoneOption {
  Local = 'local',
  UTC = 'UTC',
}

export const timezoneOptions = [
  { inputDisplay: 'Match System', value: TimezoneOption.Local },
  { inputDisplay: 'UTC', value: TimezoneOption.UTC },
]

export enum DatetimeRadioOption {
  Common = 'common',
  Custom = 'custom',
}
