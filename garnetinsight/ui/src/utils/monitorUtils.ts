import { format } from 'date-fns'
import { isFinite } from 'lodash'

export const getFormatTime = (time: string) =>
  typeof time === 'string' && isFinite(+time)
    ? format(new Date(+time * 1_000), 'HH:mm:ss.SSS')
    : 'Invalid time'
