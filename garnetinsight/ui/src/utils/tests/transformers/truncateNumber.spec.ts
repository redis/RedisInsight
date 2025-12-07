import { truncateNumberToRange } from 'uiSrc/utils'

describe('truncateNumberToRange', () => {
  it('truncateNumberToRange should return value between 0 and 999', () => {
    const number1 = 10
    const number2 = 100
    const number3 = 256
    const number4 = 612
    const number5 = 999

    const expectedResponse1 = '10'
    const expectedResponse2 = '100'
    const expectedResponse3 = '256'
    const expectedResponse4 = '612'
    const expectedResponse5 = '999'

    expect(truncateNumberToRange(number1)).toEqual(expectedResponse1)
    expect(truncateNumberToRange(number2)).toEqual(expectedResponse2)
    expect(truncateNumberToRange(number3)).toEqual(expectedResponse3)
    expect(truncateNumberToRange(number4)).toEqual(expectedResponse4)
    expect(truncateNumberToRange(number5)).toEqual(expectedResponse5)
  })

  it('truncateNumberToRange should return value between 1 K and 99 K', () => {
    const number1 = 10_000
    const number2 = 100_000
    const number3 = 256_000
    const number4 = 612_000
    const number5 = 999_000

    const expectedResponse1 = '10 K'
    const expectedResponse2 = '100 K'
    const expectedResponse3 = '256 K'
    const expectedResponse4 = '612 K'
    const expectedResponse5 = '999 K'

    expect(truncateNumberToRange(number1)).toEqual(expectedResponse1)
    expect(truncateNumberToRange(number2)).toEqual(expectedResponse2)
    expect(truncateNumberToRange(number3)).toEqual(expectedResponse3)
    expect(truncateNumberToRange(number4)).toEqual(expectedResponse4)
    expect(truncateNumberToRange(number5)).toEqual(expectedResponse5)
  })

  it('truncateNumberToRange should return value between 1 M and 999 M', () => {
    const number1 = 10_000_000
    const number2 = 100_000_000
    const number3 = 256_000_000
    const number4 = 612_000_000
    const number5 = 999_000_000

    const expectedResponse1 = '10 M'
    const expectedResponse2 = '100 M'
    const expectedResponse3 = '256 M'
    const expectedResponse4 = '612 M'
    const expectedResponse5 = '999 M'

    expect(truncateNumberToRange(number1)).toEqual(expectedResponse1)
    expect(truncateNumberToRange(number2)).toEqual(expectedResponse2)
    expect(truncateNumberToRange(number3)).toEqual(expectedResponse3)
    expect(truncateNumberToRange(number4)).toEqual(expectedResponse4)
    expect(truncateNumberToRange(number5)).toEqual(expectedResponse5)
  })

  it('truncateNumberToRange should return value between 1 B and 2 B', () => {
    const number1 = 1_000_000_001
    const number2 = 1_500_001_200
    const number3 = 2_120_042_300

    const expectedResponse1 = '1 B'
    const expectedResponse2 = '1 B'
    const expectedResponse3 = '2 B'

    expect(truncateNumberToRange(number1)).toEqual(expectedResponse1)
    expect(truncateNumberToRange(number2)).toEqual(expectedResponse2)
    expect(truncateNumberToRange(number3)).toEqual(expectedResponse3)
  })
})
