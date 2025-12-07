import * as bigStringUtil from 'uiSrc/utils/bigString'
import { getConfig } from 'uiSrc/config'
import { stringToBuffer } from 'uiSrc/utils'

const BIG_STRING_PREFIX = getConfig().app.truncatedStringPrefix

describe('bigStringUtil', () => {
  describe('isTruncatedString', () => {
    it.each([
      { input: 'some string', output: false },
      { input: JSON.stringify('some string'), output: false },
      { input: stringToBuffer('some string'), output: false },
      { input: `${BIG_STRING_PREFIX} some string`, output: true },
      {
        input: JSON.stringify(`${BIG_STRING_PREFIX} some string`),
        output: true,
      },
      {
        input: stringToBuffer(`${BIG_STRING_PREFIX} some string`),
        output: true,
      },
      { input: null, output: false },
      { input: '', output: false },
      { input: stringToBuffer(''), output: false },
    ])('%j', async ({ input, output }) => {
      expect(bigStringUtil.isTruncatedString(input)).toEqual(output)
    })
  })
})
