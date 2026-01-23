import { truncateNumberToFirstUnit } from 'uiSrc/utils'

export const NOW = 'now'
export const MINUTE = 60
export const DURATION_FIRST_REFRESH_TIME = 5
export const DEFAULT_REFRESH_RATE = '5.0'

export const getLastRefreshDelta = (time: number | null): number =>
  (Date.now() - (time || 0)) / 1_000

export const getDataTestid =
  (testid?: string) =>
  (suffix: string): string =>
    testid ? `${testid}-${suffix}` : suffix

export const getTextByRefreshTime = (
  delta: number,
  lastRefreshTime: number,
) => {
  let text = ''

  if (delta > MINUTE) {
    text = truncateNumberToFirstUnit(
      (Date.now() - (lastRefreshTime || 0)) / 1_000,
    )
  }
  if (delta < MINUTE) {
    text = '< 1 min'
  }
  if (delta < DURATION_FIRST_REFRESH_TIME) {
    text = NOW
  }

  return text
}
