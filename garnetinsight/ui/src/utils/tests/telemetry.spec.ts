import { getRangeForNumber, BULK_THRESHOLD_BREAKPOINTS } from 'uiSrc/utils'

const testCases = [
  {
    number: undefined,
    result: undefined,
  },
  {
    number: 0,
    result: '0 - 5 000',
  },
  {
    number: 10,
    result: '0 - 5 000',
  },
  {
    number: 5_000,
    result: '0 - 5 000',
  },
  {
    number: 5_001,
    result: '5 001 - 10 000',
  },
  {
    number: 7_050,
    result: '5 001 - 10 000',
  },
  {
    number: 10_000,
    result: '5 001 - 10 000',
  },
  {
    number: 10_001,
    result: '10 001 - 50 000',
  },
  {
    number: 50_000,
    result: '10 001 - 50 000',
  },
  {
    number: 50_001,
    result: '50 001 - 100 000',
  },
  {
    number: 100_000,
    result: '50 001 - 100 000',
  },
  {
    number: 1_000_000,
    result: '100 001 - 1 000 000',
  },
  {
    number: 1_000_001,
    result: '1 000 001 +',
  },
]
describe('getRangeForNumber', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.result} for number:${tc.number}`, () => {
      const range = getRangeForNumber(tc.number, BULK_THRESHOLD_BREAKPOINTS)
      expect(range).toEqual(tc.result)
    })
  })
})
