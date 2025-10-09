import {
  isVersionHigherOrEquals,
  isVersionHigher,
  isRedisVersionSupported,
} from 'uiSrc/utils'

describe('isVersionHigherOrEqual', () => {
  it('isVersionHigherOrEqual should return true if the first version provided is higher or equal', () => {
    const version1 = '6.2'
    const version2 = '6.2.9'
    const version3 = '6.2.1'
    const version4 = '6.1.9'
    const version5 = '1.2'
    const version6 = '10.2'
    const version7 = '6.2.10'
    const version8 = '10'
    const version9 = '10.0.0'

    expect(isVersionHigherOrEquals(version1, version1)).toBeTruthy()
    expect(isVersionHigherOrEquals(version2, '6.2')).toBeTruthy()
    expect(isVersionHigherOrEquals(version3, '6.2.4')).toBeFalsy()
    expect(isVersionHigherOrEquals(version4, '6.2')).toBeFalsy()
    expect(isVersionHigherOrEquals(version5, '6.2')).toBeFalsy()
    expect(isVersionHigherOrEquals(version6, '6.2')).toBeTruthy()
    expect(isVersionHigherOrEquals(version7, '6.2')).toBeTruthy()
    expect(isVersionHigherOrEquals(version8, '6.2')).toBeTruthy()
    expect(isVersionHigherOrEquals(version9, '6.2')).toBeTruthy()
  })
})

describe('isVersionHigher', () => {
  it('isVersionHigher should return true if the first version provided is higher', () => {
    const version1 = '6.2'
    const version2 = '6.2.9'
    const version3 = '6.2.1'
    const version4 = '6.1.9'
    const version5 = '1.2'
    const version6 = '10.2'
    const version7 = '6.2.10'
    const version8 = '10'
    const version9 = '10.0.0'

    expect(isVersionHigher(version1, version1)).toBeFalsy()
    expect(isVersionHigher(version2, '6.2')).toBeTruthy()
    expect(isVersionHigher(version3, '6.2.4')).toBeFalsy()
    expect(isVersionHigher(version4, '6.2')).toBeFalsy()
    expect(isVersionHigher(version5, '6.2')).toBeFalsy()
    expect(isVersionHigher(version6, '6.2')).toBeTruthy()
    expect(isVersionHigher(version7, '6.2')).toBeTruthy()
    expect(isVersionHigher(version8, '6.2')).toBeTruthy()
    expect(isVersionHigher(version9, '6.2')).toBeTruthy()
  })
})

describe('useRedisInstanceCompatibility', () => {
  const MOCK_MIN_SUPPORTED_REDIS_VERSION = '7.2.0'

  test.each([
    [undefined, false],
    [null, false],
    ['', false],
    ['7.1.9', false],
    ['7.2', true],
    ['v7.2', true],
    ['7.2.0', true],
    ['7.2.0+build.5', true],
    ['7.2.0-rc.1', false], // prerelease should NOT satisfy >=7.2.0
    ['Redis 7.2-rc1 (abc)', true], // coerced to 7.2.0 -> true (note: prerelease info lost)
    ['Redis 6 something', false],
    ['nonsense', false],
  ])('isRedisVersionSupported(%p) === %p', (input, expected) => {
    expect(
      isRedisVersionSupported(input as any, MOCK_MIN_SUPPORTED_REDIS_VERSION),
    ).toBe(expected)
  })
})
