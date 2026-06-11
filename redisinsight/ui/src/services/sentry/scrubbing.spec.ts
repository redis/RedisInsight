import type { Event } from '@sentry/core'
import {
  NON_TRACKING_ANONYMOUS_ID,
  REDACTED,
  minimizeEvent,
  normalizePath,
  scrubEvent,
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
    const frame = minimizeEvent(fullEvent).exception!.values![0].stacktrace!
      .frames![0]
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
