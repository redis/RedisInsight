import { floor } from 'lodash'
import { isValid } from 'date-fns'

export const MAX_TTL_NUMBER = 2_147_483_647
export const MAX_PORT_NUMBER = 65_535
export const MAX_TIMEOUT_NUMBER = 1_000_000
export const MAX_SCORE_DECIMAL_LENGTH = 15
export const MAX_REFRESH_RATE = 999.9
export const MIN_REFRESH_RATE = 1.0

export const entryIdRegex = /^(\*)$|^(([0-9]+)(-)((\*)$|([0-9]+$)))/
export const consumerGroupIdRegex = /^(\$)$|^0$|^(([0-9]+)(-)([0-9]+$))/

export const validateField = (text: string) => text.replace(/\s/g, '')

export const validateEntryId = (initValue: string) =>
  initValue.replace(/[^0-9-*]+/gi, '')
export const validateConsumerGroupId = (initValue: string) =>
  initValue.replace(/[^0-9-$]+/gi, '')

export const validateCountNumber = (initValue: string) => {
  const value = initValue.replace(/[^0-9]+/gi, '')

  if (+value <= 0) {
    return ''
  }

  return value
}

export const validateTTLNumber = (initValue: string) => {
  const value = +initValue.replace(/[^0-9]+/gi, '')

  if (value > MAX_TTL_NUMBER) {
    return MAX_TTL_NUMBER.toString()
  }

  if (value < 0 || (value === 0 && initValue !== '0')) {
    return ''
  }

  return value.toString()
}

export const validateTTLNumberForAddKey = (iniValue: string) =>
  validateTTLNumber(iniValue).replace(/^(0)?/, '')

export const validateListIndex = (initValue: string) =>
  initValue.replace(/[^0-9]+/gi, '')

export const validateScoreNumber = (initValue: string) => {
  let value = initValue
    .replace(/[^-0-9.]+/gi, '')
    .replace(/^(-?\d*\.?)|(-?\d*)\.?/g, '$1$2')
    .replace(/(?!^)-/g, '')

  if (
    value.includes('.') &&
    value.split('.')[1].length > MAX_SCORE_DECIMAL_LENGTH
  ) {
    const numberOfExceed = value.split('.')[1].length - MAX_SCORE_DECIMAL_LENGTH
    value = value.slice(0, -numberOfExceed)
  }
  return value.toString()
}

export const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const validateNumber = (
  initValue: string,
  minNumber: number = 0,
  maxNumber: number = Infinity,
) => {
  const positiveNumbers = /[^0-9]+/gi
  const negativeNumbers = /[^0-9-]+/gi
  const value = initValue
    ? initValue.replace(minNumber < 0 ? negativeNumbers : positiveNumbers, '')
    : ''

  if (+value > maxNumber) {
    return maxNumber.toString()
  }

  if (+value < minNumber) {
    return ''
  }

  return value.toString()
}

export const validateRefreshRateNumber = (initValue: string) => {
  let value = initValue.replace(/[^0-9.]/gi, '')

  if (countDecimals(+value) > 0) {
    value = `${floor(+value, 1)}`
  }

  if (+value > MAX_REFRESH_RATE) {
    return MAX_REFRESH_RATE.toString()
  }

  if (+value < 0) {
    return ''
  }

  return value.toString()
}

export const errorValidateRefreshRateNumber = (value: string) => {
  const decimalsRegexp = /^\d+(\.\d{1})?$/
  return !decimalsRegexp.test(value)
}

export const errorValidateNegativeInteger = (value: string) => {
  const negativeIntegerRegexp = /^-?\d+$/
  return !negativeIntegerRegexp.test(value)
}

export const validateCertName = (initValue: string) =>
  initValue.replace(/[^ a-zA-Z0-9!@#$%^&*\-_()[\]]+/gi, '').toString()

export const isRequiredStringsValid = (...params: string[]) =>
  params.every((p = '') => p.length > 0)

const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0
  return value.toString().split('.')?.[1]?.length || 0
}

const getApproximateNumber = (number: number): string =>
  number < 1 ? '<1' : `${Math.round(number)}`

export const getApproximatePercentage = (
  total?: number,
  part: number = 0,
): string => {
  const percent = (total ? part / total : 1) * 100
  return `${getApproximateNumber(percent)}%`
}

export const IS_NUMBER_REGEX = /^-?\d*(\.\d+)?$/
export const IS_TIMESTAMP = /^(\d{10}|\d{13}|\d{16}|\d{19})$/
export const IS_NEGATIVE_TIMESTAMP = /^-(\d{9}|\d{12}|\d{15}|\d{18})$/
export const IS_INTEGER_NUMBER_REGEX = /^\d+$/

const detailedTimestampCheck = (value: string) => {
  try {
    // test integer to be of 10, 13, 16 or 19 digits
    const integerPart = parseInt(value, 10).toString()

    if (
      IS_TIMESTAMP.test(integerPart) ||
      IS_NEGATIVE_TIMESTAMP.test(integerPart)
    ) {
      if (integerPart.length === value.length) {
        return true
      }
      // check part after dot separator (checking floating numbers)
      const subPart = value.replace(integerPart, '')
      return IS_INTEGER_NUMBER_REGEX.test(subPart.substring(1, subPart.length))
    }
    return false
  } catch (err) {
    // ignore errors
    return false
  }
}

// checks stringified number to may be a timestamp
export const checkTimestamp = (value: string): boolean =>
  IS_NUMBER_REGEX.test(value) && detailedTimestampCheck(value)

// checks any string to may be converted to date
export const checkConvertToDate = (value: string): boolean => {
  // if string is not number-like, try to convert it to date
  if (!IS_NUMBER_REGEX.test(value)) {
    return isValid(new Date(value))
  }

  return checkTimestamp(value)
}
