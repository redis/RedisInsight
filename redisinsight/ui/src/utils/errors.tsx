import { AxiosError } from 'axios'
import { capitalize, isEmpty, isString, isArray, set, isNumber } from 'lodash'
import React from 'react'
import i18n, { Trans } from 'uiSrc/i18n'
import { CustomErrorCodes } from 'uiSrc/constants'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { CustomError } from 'uiSrc/slices/interfaces'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { getUtmExternalLink } from './links'

export const getRdiValidationMessage = (
  message: string = '',
  loc?: Array<string | number>,
): string => {
  // first item is always "body"
  if (!loc || !isArray(loc) || loc.length < 2) {
    return message
  }

  const [, ...rest] = loc
  const formattedLoc = rest.reduce<string[]>((acc, curr) => {
    if (isNumber(curr)) {
      acc[acc.length - 1] += `[${curr}]`
    } else {
      acc.push(curr)
    }
    return acc
  }, [])

  const field = formattedLoc.pop() as string
  const path = formattedLoc.join('/')
  const words = message.split(' ')

  words[0] = path ? `${field} in ${path}` : field

  return capitalize(words.join(' '))
}

export const parseCustomError = (
  err: CustomError | string = DEFAULT_ERROR_MESSAGE,
): AxiosError => {
  const error = {
    response: {
      status: 500,
      data: {},
    },
  }

  if (isString(err)) {
    return set(error, 'response.data.message', err) as AxiosError
  }

  let title: string = i18n.t('notification.error.title.default')
  let message: React.ReactElement | string = ''
  const additionalInfo: Record<string, any> = {}

  // Shared "If the issue persists, please report it." link, reused below.
  const reportIssue = (
    <>
      {i18n.t('notification.error.reportIssue')}{' '}
      <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">
        {i18n.t('notification.error.reportIssueLink')}
      </a>
    </>
  )

  switch (err?.errorCode) {
    case CustomErrorCodes.CloudOauthGithubEmailPermission:
      title = i18n.t('api.error.code.11006.title')
      message = (
        <>
          {i18n.t('api.error.code.11006.message')}
          <br />
        </>
      )
      break
    case CustomErrorCodes.CloudOauthMisconfiguration:
      title = i18n.t('api.error.code.11005.title')
      message = (
        <>
          {i18n.t('api.error.code.11005.message')}
          <Spacer size="xs" />
          {i18n.t('notification.error.tryAgainLater')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnknownAuthorizationRequest:
      title = i18n.t('notification.error.title.default')
      message = (
        <>
          {i18n.t('api.error.code.11007.message')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnexpectedError:
      title = i18n.t('notification.error.title.default')
      message = (
        <>
          {i18n.t('api.error.code.11008.message')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break
    case CustomErrorCodes.CloudOauthSsoUnsupportedEmail:
      title = i18n.t('api.error.code.11011.title')
      message = <>{i18n.t('api.error.code.11011.message')}</>
      break
    case CustomErrorCodes.CloudApiBadRequest:
      title = i18n.t('api.error.code.11003.title')
      message = (
        <>
          {i18n.t('api.error.code.11003.message')}
          <Spacer size="xs" />
          {i18n.t('notification.error.tryAgainLater')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = i18n.t('api.error.code.11002.title')
      message = <>{i18n.t('api.error.code.11002.message')}</>
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = i18n.t('api.error.code.11000.title')
      message = (
        <>
          {i18n.t('api.error.code.11000.message')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = i18n.t('api.error.code.11004.title')
      message = (
        <>
          {i18n.t('api.error.code.11004.message')}
          <Spacer size="xs" />
          {i18n.t('notification.error.tryAgainLater')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break

    case CustomErrorCodes.CloudCapiUnauthorized:
    case CustomErrorCodes.CloudApiUnauthorized:
    case CustomErrorCodes.QueryAiUnauthorized:
      title = i18n.t('api.error.code.11001.title')
      message = (
        <>
          {i18n.t('api.error.code.11001.message')}
          <Spacer size="s" />
          {reportIssue}
        </>
      )
      break

    case CustomErrorCodes.CloudCapiKeyUnauthorized:
      title = i18n.t('api.error.code.11022.title')
      message = (
        <>
          {i18n.t('api.error.code.11022.message')}
          <Spacer size="xs" />
          {i18n.t('api.error.code.11022.removeKey')}
          <Spacer size="s" />
          {i18n.t('api.error.code.11022.manageKeys')}
        </>
      )
      additionalInfo.resourceId = err.resourceId
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
      title = i18n.t('api.error.code.11108.title')
      message = (
        <>
          {i18n.t('api.error.code.11108.message')}
          <Spacer size="s" />
          <Trans
            i18nKey="api.error.code.11108.console"
            components={{
              consoleLink: (
                <a
                  href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
                    campaign: UTM_CAMPAINGS.Main,
                    medium: UTM_MEDIUMS.Main,
                  })}
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
        </>
      )
      break

    case CustomErrorCodes.RdiDeployPipelineFailure:
      title = i18n.t('api.error.code.11401.title')
      message = err?.message || i18n.t('api.error.code.11401.message')
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.RdiValidationError:
      title = i18n.t('api.error.code.11404.title')
      if (isString(err?.details)) {
        message = err.details
      } else {
        const details = err?.details?.[0] || {}
        message = getRdiValidationMessage(details.msg, details.loc)
      }
      if (!message && err?.message) {
        message = err.message
      }
      break

    case CustomErrorCodes.AzureEntraIdTokenExpired:
      title = i18n.t('api.error.code.11024.title')
      message = err?.message || i18n.t('api.error.code.11024.message')
      additionalInfo.errorCode = err.errorCode
      break

    default: {
      title = i18n.t('notification.error.title.default')
      // Generic lookup for any other coded error, with the English message as the fallback.
      const genericKey = `api.error.code.${err?.errorCode}.message`
      message =
        err?.errorCode && i18n.exists(genericKey)
          ? i18n.t(genericKey as never, { ...(err?.resource ?? {}) })
          : err?.message || i18n.t('notification.error.default')
      break
    }
  }

  const parsedError: any = { title, message }

  if (!isEmpty(additionalInfo)) {
    parsedError.additionalInfo = additionalInfo
  }

  return set(error, 'response.data', parsedError) as AxiosError
}
