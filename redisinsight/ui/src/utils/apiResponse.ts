import { AxiosError } from 'axios'
import { first, isArray, get } from 'lodash'
import i18n from 'uiSrc/i18n'
import {
  AddRedisDatabaseStatus,
  CustomError,
  EnhancedAxiosError,
  ErrorOptions,
  IBulkOperationResult,
} from 'uiSrc/slices/interfaces'
import { parseCustomError } from 'uiSrc/utils'

export const DEFAULT_ERROR_MESSAGE = 'Something was wrong!'

export const getAxiosError = (error: EnhancedAxiosError): AxiosError => {
  if (error?.response?.data.errorCode) {
    return parseCustomError(error.response.data)
  }
  return error
}

export const createAxiosError = (options: ErrorOptions): AxiosError =>
  ({
    response: {
      data: options,
    },
  }) as AxiosError

export const getApiErrorCode = (error: AxiosError) => error?.response?.status

export function getApiErrorMessage(error: AxiosError): string {
  // @ts-ignore
  const errorMessage = error?.response?.data?.message
  if (!error || !error.response) {
    return DEFAULT_ERROR_MESSAGE
  }
  if (isArray(errorMessage)) {
    return first(errorMessage)
  }

  return errorMessage
}

export function getApiErrorName(error: AxiosError): string {
  return get(error, 'response.data.name', 'Error') ?? ''
}

// Translate a backend error by its stable `errorCode` (`notification.error.code.<code>`),
// filling interpolation vars from `resource`. Falls back to the API's English
// `message` when the code is unmapped.
export function getTranslatedApiError(error: AxiosError): string {
  const data = error?.response?.data as CustomError | undefined
  const key = `notification.error.code.${data?.errorCode}.message`

  if (data?.errorCode && i18n.exists(key)) {
    return i18n.t(key as never, { ...(data.resource ?? {}) })
  }

  const apiMessage = getApiErrorMessage(error)
  return apiMessage === DEFAULT_ERROR_MESSAGE
    ? i18n.t('notification.error.default')
    : apiMessage
}

// Localized title for a coded error, mirroring getTranslatedApiError: translate
// by errorCode, else fall back to the title from the response.
export function getTranslatedApiTitle(error: AxiosError): string | undefined {
  const data = error?.response?.data as CustomError | undefined
  const key = `notification.error.code.${data?.errorCode}.title`

  if (data?.errorCode && i18n.exists(key)) {
    return i18n.t(key as never)
  }

  return get(error, 'response.data.title')
}

export function getApiErrorsFromBulkOperation(
  operations: IBulkOperationResult[],
  ...errorNames: string[]
): AxiosError[] {
  let result: AxiosError<any>[] = []
  try {
    result = operations
      .filter((item) => item.status === AddRedisDatabaseStatus.Fail)
      .filter((item) =>
        errorNames.length ? errorNames.includes(item?.error?.name) : true,
      )
      .map((item) => ({ response: { data: item.error } }) as AxiosError)
  } catch (e) {
    // continue regardless of error
  }
  return result
}
