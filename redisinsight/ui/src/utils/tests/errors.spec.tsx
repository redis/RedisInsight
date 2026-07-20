import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { parseCustomError, getRdiValidationMessage, Maybe } from 'uiSrc/utils'
import { CustomError } from 'uiSrc/slices/interfaces'
import { CustomErrorCodes } from 'uiSrc/constants'

type ExpectedError = {
  title?: string
  // a substring expected in the rendered message (assertions are text-based
  // rather than deep-equal on JSX, so wording/markup tweaks don't break them)
  contains: string
  additionalInfo?: Record<string, unknown>
}

const parseCustomErrorTests: Array<
  [Maybe<string | Partial<CustomError>>, ExpectedError]
> = [
  [undefined, { contains: 'Something was wrong!' }],
  ['', { contains: '' }],
  ['test', { contains: 'test' }],
  [
    { errorCode: 11_003 },
    { title: 'Bad request', contains: 'Your request resulted in an error.' },
  ],
  [
    { errorCode: 11_002 },
    {
      title: 'Access denied',
      contains: 'You do not have permission to access Redis Cloud.',
    },
  ],
  [
    { errorCode: 11_000 },
    { title: 'Server error', contains: 'Try restarting Redis Insight.' },
  ],
  [
    { errorCode: 11_004 },
    {
      title: 'Resource was not found',
      contains: 'Resource requested could not be found.',
    },
  ],
  [
    { errorCode: 11_001 },
    {
      title: 'Session expired',
      contains: 'Sign in again to continue working with Redis Cloud.',
    },
  ],
  [
    { errorCode: 11_021 },
    {
      title: 'Session expired',
      contains: 'Sign in again to continue working with Redis Cloud.',
    },
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthGithubEmailPermission },
    {
      title: 'Github Email Permission',
      contains: 'Unable to get an email from the GitHub account.',
    },
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthMisconfiguration },
    {
      title: 'Misconfiguration',
      contains: 'Authorization server encountered a misconfiguration error',
    },
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthUnknownAuthorizationRequest },
    { title: 'Error', contains: 'Unknown authorization request.' },
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthUnexpectedError },
    { title: 'Error', contains: 'An unexpected error occurred.' },
  ],
  [
    { errorCode: CustomErrorCodes.CloudOauthSsoUnsupportedEmail },
    { title: 'Invalid email', contains: 'used to sign in with SSO' },
  ],
  [
    { errorCode: 111_001 },
    { title: 'Error', contains: 'Something was wrong!' },
  ],
  [
    { errorCode: 11_108 },
    {
      title: 'Database already exists',
      contains: 'You already have a free Redis Cloud database running.',
    },
  ],
  [
    { errorCode: 11_022 },
    {
      title: 'Invalid API key',
      contains: 'Your Redis Cloud authorization failed.',
      additionalInfo: { errorCode: 11_022, resourceId: undefined },
    },
  ],
  [
    { errorCode: 11_401 },
    {
      title: 'Pipeline not deployed',
      contains: 'found some errors in your pipeline',
      additionalInfo: { errorCode: 11_401 },
    },
  ],
]

describe('parseCustomError', () => {
  test.each(parseCustomErrorTests)(
    '%j',
    (input, { title, contains, additionalInfo }) => {
      const { response }: any = parseCustomError(
        input as Maybe<string | CustomError>,
      )
      expect(response.data.title).toBe(title)

      const { container } = render(<div>{response.data.message}</div>)
      expect(container.textContent).toContain(contains)

      if (additionalInfo) {
        expect(response.data.additionalInfo).toEqual(additionalInfo)
      }
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
