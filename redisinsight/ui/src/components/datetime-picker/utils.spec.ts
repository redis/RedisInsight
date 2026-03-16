import { IRedisCommand } from 'uiSrc/constants'
import { commandHasUnixTimeArgs } from './utils'

const mockCommands: IRedisCommand[] = [
  {
    token: 'SET',
    arguments: [
      { token: 'key', type: 'key' as any },
      { token: 'value', type: 'string' as any },
      {
        type: 'oneof' as any,
        arguments: [
          { name: 'seconds', type: 'integer' as any, token: 'EX' },
          { name: 'milliseconds', type: 'integer' as any, token: 'PX' },
          {
            name: 'unix-time-seconds',
            type: 'unix-time' as any,
            token: 'EXAT',
          },
          {
            name: 'unix-time-milliseconds',
            type: 'unix-time' as any,
            token: 'PXAT',
          },
        ],
      },
    ],
  },
  {
    token: 'GET',
    arguments: [{ token: 'key', type: 'key' as any }],
  },
  {
    token: 'TS.RANGE',
    arguments: [
      { token: 'key', type: 'key' as any },
      { name: 'fromTimestamp', type: 'unix-time' as any },
      { name: 'toTimestamp', type: 'unix-time' as any },
    ],
  },
  {
    token: 'EXPIREAT',
    arguments: [
      { token: 'key', type: 'key' as any },
      { name: 'timestamp', type: 'unix-time' as any },
    ],
  },
]

describe('commandHasUnixTimeArgs', () => {
  it('should return true for SET which has EXAT/PXAT unix-time args', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'SET mykey myvalue')).toBe(true)
  })

  it('should return true for TS.RANGE which has direct unix-time args', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'TS.RANGE mykey 0 100')).toBe(
      true,
    )
  })

  it('should return true for EXPIREAT which has unix-time arg', () => {
    expect(
      commandHasUnixTimeArgs(mockCommands, 'EXPIREAT mykey 1234567890'),
    ).toBe(true)
  })

  it('should return false for GET which has no unix-time args', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'GET mykey')).toBe(false)
  })

  it('should return false for unknown commands', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'UNKNOWN command')).toBe(false)
  })

  it('should return false for empty query', () => {
    expect(commandHasUnixTimeArgs(mockCommands, '')).toBe(false)
  })

  it('should return false for whitespace-only query', () => {
    expect(commandHasUnixTimeArgs(mockCommands, '   ')).toBe(false)
  })

  it('should be case-insensitive for command matching', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'set mykey myvalue')).toBe(true)
    expect(commandHasUnixTimeArgs(mockCommands, 'ts.range mykey 0 100')).toBe(
      true,
    )
  })

  it('should return false for empty commands array', () => {
    expect(commandHasUnixTimeArgs([], 'SET mykey myvalue')).toBe(false)
  })

  it('should return true when any line has a unix-time command (multi-line query)', () => {
    expect(
      commandHasUnixTimeArgs(mockCommands, 'GET key\nEXPIREAT mykey '),
    ).toBe(true)
  })

  it('should return true when first line has unix-time command in multi-line query', () => {
    expect(
      commandHasUnixTimeArgs(mockCommands, 'EXPIREAT mykey 0\nGET key'),
    ).toBe(true)
  })

  it('should return false when all lines have non-unix-time commands', () => {
    expect(commandHasUnixTimeArgs(mockCommands, 'GET a\nGET b')).toBe(false)
  })
})
