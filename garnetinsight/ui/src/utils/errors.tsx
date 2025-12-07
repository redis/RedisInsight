import { AxiosError } from 'axios'
import { capitalize, isEmpty, isString, isArray, set, isNumber } from 'lodash'
import React from 'react'
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

  let title: string = 'Error'
  let message: React.ReactElement | string = ''
  const additionalInfo: Record<string, any> = {}

  switch (err?.errorCode) {
    case CustomErrorCodes.CloudOauthGithubEmailPermission:
      title = 'Github Email Permission'
      message = (
        <>
          Unable to get an email from the GitHub account. Make sure that it is
          available.
          <br />
        </>
      )
      break
    case CustomErrorCodes.CloudOauthMisconfiguration:
      title = 'Misconfiguration'
      message = (
        <>
          Authorization server encountered a misconfiguration error and was
          unable to complete your request.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnknownAuthorizationRequest:
      title = 'Error'
      message = (
        <>
          Unknown authorization request.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnexpectedError:
      title = 'Error'
      message = (
        <>
          An unexpected error occurred.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthSsoUnsupportedEmail:
      title = 'Invalid email'
      message = <>Invalid email.</>
      break
    case CustomErrorCodes.CloudApiBadRequest:
      title = 'Bad request'
      message = (
        <>
          Your request resulted in an error.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = 'Access denied'
      message = <>You do not have permission to access Azure Cosmos DB Garnet Cache.</>
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = 'Server error'
      message = (
        <>
          Try restarting Garnet Insight.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = 'Resource was not found'
      message = (
        <>
          Resource requested could not be found.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiUnauthorized:
    case CustomErrorCodes.CloudApiUnauthorized:
    case CustomErrorCodes.QueryAiUnauthorized:
      title = 'Session expired'
      message = (
        <>
          Sign in again to continue working with Azure Cosmos DB Garnet Cache.
          <Spacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiKeyUnauthorized:
      title = 'Invalid API key'
      message = (
        <>
          Your Azure Cosmos DB Garnet Cache authorization failed.
          <Spacer size="xs" />
          Remove the invalid API key from Garnet Insight and try again.
          <Spacer size="s" />
          Open the Settings page to manage Azure Cosmos DB Garnet Cache API keys.
        </>
      )
      additionalInfo.resourceId = err.resourceId
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
      title = 'Database already exists'
      message = (
        <>
          You already have a free Azure Cosmos DB Garnet Cache database running.
          <Spacer size="s" />
          Check out your
          <a
            href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
              campaign: UTM_CAMPAINGS.Main,
              medium: UTM_MEDIUMS.Main,
            })}
            target="_blank"
            rel="noreferrer"
          >
            Cloud console
          </a>
          for connection details.
        </>
      )
      break

    case CustomErrorCodes.RdiDeployPipelineFailure:
      title = 'Pipeline not deployed'
      message =
        err?.message ||
        'Unfortunately we’ve found some errors in your pipeline.'
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.RdiValidationError:
      title = 'Validation error'
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

    default:
      title = 'Error'
      message = err?.message || DEFAULT_ERROR_MESSAGE
      break
  }

  const parsedError: any = { title, message }

  if (!isEmpty(additionalInfo)) {
    parsedError.additionalInfo = additionalInfo
  }

  return set(error, 'response.data', parsedError) as AxiosError
}
