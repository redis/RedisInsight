import { isNil } from 'lodash'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { Maybe } from 'uiSrc/utils'

export const BULK_THRESHOLD_BREAKPOINTS = [5000, 10000, 50000, 100000, 1000000]

export const getRangeForNumber = (
  value: Maybe<number>,
  breakpoints: number[] = BULK_THRESHOLD_BREAKPOINTS,
): Maybe<string> => {
  if (isNil(value)) {
    return undefined
  }
  const index = breakpoints.findIndex((threshold: number) => value <= threshold)
  if (index === 0) {
    return `0 - ${numberWithSpaces(breakpoints[0])}`
  }
  if (index === -1) {
    const lastItem = breakpoints[breakpoints.length - 1]
    return `${numberWithSpaces(lastItem + 1)} +`
  }
  return `${numberWithSpaces(
    breakpoints[index - 1] + 1,
  )} - ${numberWithSpaces(breakpoints[index])}`
}
