import type { Event } from '@sentry/core'
import {
  NON_TRACKING_ANONYMOUS_ID,
  REDACTED,
  minimizeEvent,
  normalizePath,
  scrubEvent,
  scrubSecretsInText,
  scrubSensitiveData,
} from './scrubbing'

describe('scrubSensitiveData', () => {
  it('redacts keys whose name contains a sensitive substring', () => {
    const result = scrubSensitiveData({
      password: 'p',
      sentinelPassword: 's',
      apiKey: 'k',
      authorization: 'Bearer x',
      host: 'localhost',
    }) as Record<string, unknown>

    expect(result.password).toBe(REDACTED)
    expect(result.sentinelPassword).toBe(REDACTED)
    expect(result.apiKey).toBe(REDACTED)
    expect(result.authorization).toBe(REDACTED)
    expect(result.host).toBe('localhost')
  })

  it('redacts nested objects and arrays', () => {
    const result = scrubSensitiveData({
      connection: { token: 't', port: 6379 },
      list: [{ secret: 'a' }, { name: 'ok' }],
    }) as any

    expect(result.connection.token).toBe(REDACTED)
    expect(result.connection.port).toBe(6379)
    expect(result.list[0].secret).toBe(REDACTED)
    expect(result.list[1].name).toBe('ok')
  })

  it('passes through primitives and null', () => {
    expect(scrubSensitiveData(null)).toBeNull()
    expect(scrubSensitiveData('plain')).toBe('plain')
    expect(scrubSensitiveData(42)).toBe(42)
  })
})

describe('scrubSecretsInText', () => {
  it('redacts credentials embedded in connection URIs', () => {
    expect(
      scrubSecretsInText('connect redis://user:p4ss@host:6379 failed'),
    ).toBe(`connect redis://${REDACTED}@host:6379 failed`)
    expect(scrubSecretsInText('rediss://default:secret@h')).toBe(
      `rediss://${REDACTED}@h`,
    )
  })

  it('redacts secret assignments in free text', () => {
    expect(scrubSecretsInText('password=hunter2 ok')).toBe(
      `password=${REDACTED} ok`,
    )
    expect(scrubSecretsInText('token: abc.def')).toBe(`token: ${REDACTED}`)
    expect(scrubSecretsInText('apiKey="xyz"')).toBe(`apiKey=${REDACTED}`)
  })

  it('leaves clean text and credential-free URLs intact', () => {
    expect(scrubSecretsInText('connection refused')).toBe('connection refused')
    expect(scrubSecretsInText('https://example.com/api?id=1')).toBe(
      'https://example.com/api?id=1',
    )
    expect(scrubSecretsInText('compass bearing set')).toBe(
      'compass bearing set',
    )
  })

  it('returns falsy input unchanged', () => {
    expect(scrubSecretsInText(undefined)).toBeUndefined()
    expect(scrubSecretsInText('')).toBe('')
  })
})

describe('normalizePath', () => {
  it.each([
    ['/Users/jane/app/main.js', '/Users/<user>/app/main.js'],
    ['/home/jane/app/main.js', '/home/<user>/app/main.js'],
    ['C:\\Users\\jane\\app\\main.js', 'C:\\Users\\<user>\\app\\main.js'],
  ])('strips the user segment from %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected)
  })

  it('returns falsy input unchanged', () => {
    expect(normalizePath(undefined)).toBeUndefined()
    expect(normalizePath('')).toBe('')
  })

  it('leaves paths without a user segment intact', () => {
    expect(normalizePath('/app.asar/dist/main.js')).toBe(
      '/app.asar/dist/main.js',
    )
  })
})

describe('scrubEvent', () => {
  it('scrubs extra, contexts, request and breadcrumb data', () => {
    const event: Event = {
      extra: { password: 'p', safe: 1 },
      contexts: { redis: { token: 't' } as any },
      request: { headers: { authorization: 'Bearer x' } },
      breadcrumbs: [{ data: { secret: 's', url: '/keys' } }],
    }

    const result = scrubEvent(event)

    expect((result.extra as any).password).toBe(REDACTED)
    expect((result.extra as any).safe).toBe(1)
    expect((result.contexts as any).redis.token).toBe(REDACTED)
    expect((result.request as any).headers.authorization).toBe(REDACTED)
    expect(result.breadcrumbs?.[0].data?.secret).toBe(REDACTED)
    expect(result.breadcrumbs?.[0].data?.url).toBe('/keys')
  })

  it('normalizes stack-frame paths', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'Error',
            value: 'boom',
            stacktrace: {
              frames: [
                {
                  filename: '/Users/jane/app/x.js',
                  abs_path: '/Users/jane/app/x.js',
                },
              ],
            },
          },
        ],
      },
    }

    const frame = scrubEvent(event).exception!.values![0].stacktrace!.frames![0]
    expect(frame.filename).toBe('/Users/<user>/app/x.js')
    expect(frame.abs_path).toBe('/Users/<user>/app/x.js')
  })

  it('redacts secrets in message, exception value, breadcrumb message and request', () => {
    const event: Event = {
      message: 'connect redis://user:pw@host failed',
      exception: {
        values: [{ type: 'Error', value: 'auth to redis://u:p@h failed' }],
      },
      breadcrumbs: [{ message: 'using token: abc123' }],
      request: { url: 'redis://user:pw@host/0', query_string: 'password=x' },
    }

    const result = scrubEvent(event)

    expect(result.message).toBe(`connect redis://${REDACTED}@host failed`)
    expect(result.exception!.values![0].value).toBe(
      `auth to redis://${REDACTED}@h failed`,
    )
    expect(result.breadcrumbs?.[0].message).toBe(`using token: ${REDACTED}`)
    expect((result.request as any).url).toBe(`redis://${REDACTED}@host/0`)
    expect((result.request as any).query_string).toBe(`password=${REDACTED}`)
  })

  it('scrubs secrets from frame source context', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'Error',
            value: 'x',
            stacktrace: {
              frames: [
                {
                  filename: '/app/db.js',
                  context_line: "connect('redis://u:pw@h')",
                  pre_context: ['const token = "abc123secret"'],
                },
              ],
            },
          },
        ],
      },
    }

    const frame = scrubEvent(event).exception!.values![0].stacktrace!.frames![0]
    expect(frame.context_line).toBe(`connect('redis://${REDACTED}@h')`)
    expect(frame.pre_context?.[0]).toContain(REDACTED)
  })

  it('clears server_name and the client IP', () => {
    const event: Event = {
      server_name: 'jane-macbook',
      user: { id: 'u1', ip_address: '1.2.3.4' },
    }

    const result = scrubEvent(event)
    expect(result.server_name).toBeUndefined()
    expect(result.user?.ip_address).toBeUndefined()
    expect(result.user?.id).toBe('u1')
  })
})

describe('minimizeEvent', () => {
  const fullEvent: Event = {
    event_id: 'abc',
    release: 'redisinsight@1.0.0',
    environment: 'production',
    message: 'connection to redis://user:pass@host failed',
    exception: {
      values: [
        {
          type: 'DriverError',
          value: 'redis://user:pass@host failed',
          stacktrace: {
            frames: [
              {
                function: 'connect',
                filename: '/Users/jane/app/db.js',
                lineno: 10,
                vars: { password: 'p' } as any,
                context_line: 'const x = secret',
              },
            ],
          },
        },
      ],
    },
    breadcrumbs: [{ data: { url: '/keys' } }],
    request: { url: 'http://localhost/api' },
    extra: { foo: 'bar' },
    contexts: {
      os: { name: 'macOS' } as any,
      runtime: { name: 'node' } as any,
      device: { name: 'jane-macbook' } as any,
    },
    user: { id: 'real-anon-id' },
  }

  it('keeps only the allowlisted fields', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.release).toBe('redisinsight@1.0.0')
    expect(result.environment).toBe('production')
    expect(result.exception!.values![0].type).toBe('DriverError')
    expect(result.contexts?.os).toEqual({ name: 'macOS' })
    expect(result.contexts?.runtime).toEqual({ name: 'node' })
  })

  it('drops the message, breadcrumbs, request and extra', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.message).toBeUndefined()
    expect(result.breadcrumbs).toBeUndefined()
    expect(result.request).toBeUndefined()
    expect(result.extra).toBeUndefined()
    expect(result.exception!.values![0].value).toBe('')
  })

  it('strips frame locals/source and normalizes paths', () => {
    const frame =
      minimizeEvent(fullEvent).exception!.values![0].stacktrace!.frames![0]
    expect(frame.function).toBe('connect')
    expect(frame.filename).toBe('/Users/<user>/app/db.js')
    expect((frame as any).vars).toBeUndefined()
    expect(frame.context_line).toBeUndefined()
  })

  it('forces the shared anonymous id and drops device context', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.user).toEqual({ id: NON_TRACKING_ANONYMOUS_ID })
    expect(result.contexts?.device).toBeUndefined()
    expect(result.tags?.tier).toBe('anonymous')
  })
})
