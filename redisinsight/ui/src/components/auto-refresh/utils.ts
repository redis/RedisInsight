import { TFunction } from 'i18next'
import { truncateNumberToFirstUnit } from 'uiSrc/utils'

export const MINUTE = 60
export const DURATION_FIRST_REFRESH_TIME = 5
export const DEFAULT_REFRESH_RATE = '5.0'

export const getTextByRefreshTime = (
  delta: number,
  lastRefreshTime: number,
  t: TFunction,
) => {
  let text = ''

  if (delta > MINUTE) {
    text = truncateNumberToFirstUnit(
      (Date.now() - (lastRefreshTime || 0)) / 1_000,
    )
  }
  if (delta < MINUTE) {
    text = t('autoRefresh.time.lessThanMinute')
  }
  if (delta < DURATION_FIRST_REFRESH_TIME) {
    text = t('autoRefresh.time.now')
  }

  return text
}
