import { format } from 'date-fns'

export const getFormatDateTime = (time: number = 0) =>
  format(new Date(+time), 'HH:mm:ss dd MMM yyyy')
