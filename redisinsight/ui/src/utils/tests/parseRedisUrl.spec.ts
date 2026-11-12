import { parseRedisUrl } from 'uiSrc/utils/parseRedisUrl'

const defaultRedisParams = {
  protocol: 'redis',
  username: '',
  password: '',
  port: undefined,
  dbNumber: undefined,
}

const parseRedisUrlTests: Array<[string, any]> = [
  ['http://user:pass@localhost:6380', null],
  ['localhost', null],
  [
    'localhost:6379',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6379,
      hostname: 'localhost:6379',
    },
  ],
  [
    'redis://localhost',
    { ...defaultRedisParams, host: 'localhost', hostname: 'localhost' },
  ],
  [
    'redis://:@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'redis://user:pass/@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
      username: 'user',
      password: 'pass/',
    },
  ],
  [
    'redis://user:pa@ss@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
      username: 'user',
      password: 'pa@ss',
    },
  ],
  [
    'redis://us@er:pa@ss@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
      username: 'us@er',
      password: 'pa@ss',
    },
  ],
  [
    'redis://us@er:pa@:ss@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
      username: 'us@er',
      password: 'pa@:ss',
    },
  ],
  [
    'redis://localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'redis://@localhost:6380',
    {
      ...defaultRedisParams,
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'redis://user@localhost:6380',
    {
      ...defaultRedisParams,
      username: 'user',
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'redis://:pass@localhost:6380',
    {
      ...defaultRedisParams,
      password: 'pass',
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'redis://user:pass@localhost:6380',
    {
      ...defaultRedisParams,
      username: 'user',
      password: 'pass',
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'rediss://user:pa%712ss@localhost:6380',
    {
      ...defaultRedisParams,
      protocol: 'rediss',
      username: 'user',
      password: 'pa%712ss',
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
    },
  ],
  [
    'rediss://d&@&21^$:pa%@7:12:ss@local-host-123.net.com:6380',
    {
      ...defaultRedisParams,
      protocol: 'rediss',
      username: 'd&@&21^$',
      password: 'pa%@7:12:ss',
      host: 'local-host-123.net.com',
      port: 6380,
      hostname: 'local-host-123.net.com:6380',
    },
  ],
  [
    'rediss://user:pa%712ss@localhost:6380/2',
    {
      protocol: 'rediss',
      username: 'user',
      password: 'pa%712ss',
      host: 'localhost',
      port: 6380,
      hostname: 'localhost:6380',
      dbNumber: 2,
    },
  ],
  [
    '[::1]:6379',
    {
      ...defaultRedisParams,
      host: '::1',
      port: 6379,
      hostname: '::1:6379',
    },
  ],
  ['redis://[::1]', { ...defaultRedisParams, host: '::1', hostname: '::1' }],
  [
    'rediss://user:pa@ss@[2001:db8::1]:6380/2',
    {
      protocol: 'rediss',
      username: 'user',
      password: 'pa@ss',
      host: '2001:db8::1',
      port: 6380,
      hostname: '2001:db8::1:6380',
      dbNumber: 2,
    },
  ],
  [
    'redis://[::1]:6379/1',
    {
      ...defaultRedisParams,
      host: '::1',
      port: 6379,
      hostname: '::1:6379',
      dbNumber: 1,
    },
  ],
  ['redis://[::1', null],
  ['redis://[]:6379', null],
  ['redis://[abc]:6379', null],
  ['[abc]:6379', null],
]

describe('parseRedisUrl', () => {
  it.each(parseRedisUrlTests)(
    'for input: %s (index), %s (shift), should be output: %s',
    (url, expected) => {
      const result = parseRedisUrl(url)
      expect(result).toEqual(expected)
    },
  )
})
