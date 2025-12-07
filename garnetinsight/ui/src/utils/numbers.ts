import { toNumber, isNull } from 'lodash'
import { Nullable } from 'uiSrc/utils'

export const isNaNConvertedString = (value: string): boolean =>
  Number.isNaN(toNumber(value))

export const numberWithSpaces = (number: number = 0) =>
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export const nullableNumberWithSpaces = (number: Nullable<number> = 0) => {
  if (isNull(number)) {
    return '-'
  }
  return numberWithSpaces(number)
}

export const getPercentage = (
  value = 0,
  sum = 1,
  round = false,
  decimals = 2,
) => {
  const percent = parseFloat(((value / sum) * 100).toFixed(decimals))
  return round ? Math.round(percent) : percent
}
