import { set, cloneDeep } from 'lodash'
import React from 'react'
import { AxiosError } from 'axios'
import { RiSpacer } from 'uiBase/layout/spacer'
import { parseCustomError, getRdiValidationMessage, Maybe } from 'uiSrc/utils'
import { CustomError } from 'uiSrc/slices/interfaces'
import { CustomErrorCodes } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

const responseData = { response: { data: {}, status: 500 } }

const parseCustomErrorTests = [
  [
    undefined,
    set(cloneDeep(responseData), 'response.data', {
      message: 'Something was wrong!',
    }),
  ],
  ['', set(cloneDeep(responseData), 'response.data', { message: '' })],
  ['test', set(cloneDeep(responseData), 'response.data', { message: 'test' })],
  [
    { errorCode: 11_003 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Bad request',
      message: (
        <>
          Your request resulted in an error.
          <RiSpacer size="xs" />
          Try again later.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: 11_002 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Access denied',
      message: <>You do not have permission to access Redis Cloud.</>,
    }),
  ],
  [
    { errorCode: 11_000 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Server error',
      message: (
        <>
          Try restarting Redis Insight.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: 11_004 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Resource was not found',
      message: (
        <>
          Resource requested could not be found.
          <RiSpacer size="xs" />
          Try again later.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: 11_001 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Session expired',
      message: (
        <>
          Sign in again to continue working with Redis Cloud.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: 11_021 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Session expired',
      message: (
        <>
          Sign in again to continue working with Redis Cloud.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthGithubEmailPermission },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Github Email Permission',
      message: (
        <>
          Unable to get an email from the GitHub account. Make sure that it is
          available.
          <br />
        </>
      ),
    }),
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthMisconfiguration },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Misconfiguration',
      message: (
        <>
          Authorization server encountered a misconfiguration error and was
          unable to complete your request.
          <RiSpacer size="xs" />
          Try again later.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthUnknownAuthorizationRequest },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Error',
      message: (
        <>
          Unknown authorization request.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthUnexpectedError },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Error',
      message: (
        <>
          An unexpected error occurred.
          <RiSpacer size="s" />
          If the issue persists,{' '}
          <a
            href={EXTERNAL_LINKS.githubIssues}
            target="_blank"
            rel="noreferrer"
          >
            report the issue.
          </a>
        </>
      ),
    }),
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthSsoUnsupportedEmail },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Invalid email',
      message: <>Invalid email.</>,
    }),
  ],
  [
    { errorCode: 111_001 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Error',
      message: 'Something was wrong!',
    }),
  ],
  [
    { errorCode: 11_108 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Database already exists',
      message: (
        <>
          You already have a free trial Redis Cloud database running.
          <RiSpacer size="s" />
          Check out your
          <a
            href="https://cloud.redis.io/?utm_source=redisinsight&utm_medium=main&utm_campaign=main#/databases/"
            target="_blank"
            rel="noreferrer"
          >
            Cloud console
          </a>
          for connection details.
        </>
      ),
    }),
  ],
  [
    { errorCode: 11_022 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Invalid API key',
      message: (
        <>
          Your Redis Cloud authorization failed.
          <RiSpacer size="xs" />
          Remove the invalid API key from Redis Insight and try again.
          <RiSpacer size="s" />
          Open the Settings page to manage Redis Cloud API keys.
        </>
      ),
      additionalInfo: {
        errorCode: 11022,
        resourceId: undefined,
      },
    }),
  ],
  [
    { errorCode: 11_401 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Pipeline not deployed',
      message: 'Unfortunately we’ve found some errors in your pipeline.',
      additionalInfo: {
        errorCode: 11_401,
      },
    }),
  ],
]

describe('parseCustomError', () => {
  test.each(parseCustomErrorTests as [string | CustomError, AxiosError][])(
    '%j',
    (input, expected) => {
      const result = parseCustomError(input)
      expect(result).toEqual(expected)
    },
  )
})

const getRdiValidationMessageTests: Array<
  [[Maybe<string>, Array<string | number>], string]
> = [
  [[undefined, []], ''],
  [['Custom message', []], 'Custom message'],
  [['Input is required', ['field']], 'Input is required'],
  [['Input required', ['body', 'targets']], 'Targets required'],
  [
    [
      "Input should be 'postgresql', 'mysql', 'oracle', 'cassandra', 'sqlserver' or 'redis'",
      ['body', 'targets', 'type'],
    ],
    "Type in targets should be 'postgresql', 'mysql', 'oracle', 'cassandra', 'sqlserver' or 'redis'",
  ],
  [
    [
      'Input should be a valid integer, unable to parse string as an integer',
      ['body', 'targets', 'my-redis', 'connection'],
    ],
    'Connection in targets/my-redis should be a valid integer, unable to parse string as an integer',
  ],
  [
    [
      'Input should be a valid integer, unable to parse string as an integer',
      ['body', 'targets', 'my-redis', 0],
    ],
    'My-redis[0] in targets should be a valid integer, unable to parse string as an integer',
  ],
  [['Input required', ['body', 'targets', 0]], 'Targets[0] required'],
  [
    [
      'Input should be a valid integer, unable to parse string as an integer',
      ['body', 'targets', 'my-redis', 2, 'db', 'password'],
    ],
    'Password in targets/my-redis[2]/db should be a valid integer, unable to parse string as an integer',
  ],
  [
    [
      'Input should be a valid integer, unable to parse string as an integer',
      ['body', 'targets', 'my-redis', 2, 'password'],
    ],
    'Password in targets/my-redis[2] should be a valid integer, unable to parse string as an integer',
  ],
  [
    [
      'Input should be a valid integer, unable to parse string as an integer',
      ['body', 'targets', 'my-redis', 2, 'password', 0],
    ],
    'Password[0] in targets/my-redis[2] should be a valid integer, unable to parse string as an integer',
  ],
]

describe('getRdiValidationMessage', () => {
  test.each(getRdiValidationMessageTests)('%j', (input, expected) => {
    const result = getRdiValidationMessage(...input)
    expect(result).toEqual(expected)
  })
})
