import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/cypherTokens'
import { getJmespathMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/jmespathTokens'
import { getSqliteFunctionsMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/sqliteFunctionsTokens'
import { getRediSearchSubRedisMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensSubRedis'
import { MOCKED_REDIS_COMMANDS } from 'uiSrc/mocks/data/mocked_redis_commands'

describe('getCypherMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getCypherMonarchTokensProvider()).toBeTruthy()
  })
})

describe('getJmespathMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getJmespathMonarchTokensProvider([])).toBeTruthy()
  })
})

describe('getSqliteFunctionsMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getSqliteFunctionsMonarchTokensProvider([])).toBeTruthy()
  })
})

describe('getRediSearchMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getRediSearchSubRedisMonarchTokensProvider([])).toBeTruthy()
  })

  it('should be truthy with command', () => {
    const commands = Object.keys(MOCKED_REDIS_COMMANDS).map((key) => ({
      ...MOCKED_REDIS_COMMANDS[key],
      name: key,
    }))
    expect(getRediSearchSubRedisMonarchTokensProvider(commands)).toBeTruthy()
  })
})
