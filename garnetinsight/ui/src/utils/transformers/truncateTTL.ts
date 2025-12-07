import { formatDuration, intervalToDuration } from 'date-fns'
import { isNumber } from 'lodash'

import { MAX_TTL_NUMBER } from '../validations'

const TRUNCATE_DELIMITER = ', '
// Replace default strings of duration to cutted
// 94 years, 9 month, 3 minutes => 94 yr, 9mo, 3min
export const cutDurationText = (text = '') =>
  text
    .replace(/years?/, 'yr')
    .replace(/months?/, 'mo')
    .replace(/days?/, 'd')
    .replace(/hours?/, 'h')
    .replace(/minutes?/, 'min')
    .replace(/seconds?/, 's')

// truncate TTL to Range:
// 500 => 500
// 1500 => 1 K
// 2500000 => 2 M
// 2500000000 => 2 B
export const truncateTTLToRange = (ttl: number) => {
  if (!isNumber(ttl)) {
    return '-'
  }
  if (ttl === -1) {
    return 'No limit'
  }

  if (ttl >= 0 && ttl < 1_000) {
    return `${ttl}`
  }

  const thousand = 1_000
  const million = 1_000_000
  const billion = 1_000_000_000

  if (ttl >= thousand && ttl < million) {
    return `${Math.floor(ttl / thousand)} K`
  }

  if (ttl >= million && ttl < billion) {
    return `${Math.floor(ttl / million)} M`
  }

  if (ttl >= billion && ttl <= MAX_TTL_NUMBER) {
    return `${Math.floor(ttl / billion)} B`
  }

  return `${ttl}`
}

// truncate TTL to Seconds with spaces:
// 500 => 8min, 20s
// 1500 => 25 min
// 2500000 => 28d, 22h, 26min
export const truncateNumberToDuration = (number: number): string => {
  try {
    const duration = intervalToDuration({
      start: 0,
      end: number * 1_000,
    })

    const formattedDuration = formatDuration(duration, {
      delimiter: TRUNCATE_DELIMITER,
    })

    return cutDurationText(formattedDuration)
  } catch (e) {
    return ''
  }
}

// truncate TTL to Seconds with spaces:
// 500 => 500
// 1500 => 1 500
// 2500000 => 2 500 000
export const truncateTTLToSeconds = (ttl: number) =>
  ttl?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') ?? ''

export const truncateNumberToFirstUnit = (number: number): string =>
  truncateNumberToDuration(number).split(TRUNCATE_DELIMITER)[0]
