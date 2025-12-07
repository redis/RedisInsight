import { transformQueryParamsObject } from 'uiSrc/utils'

const transformQueryParamsObjectTests: any[] = [
  [
    { v1: 'true', v2: '123', v3: 'qwe', v4: '1q' },
    { v1: true, v2: 123, v3: 'qwe', v4: '1q' },
  ],
  [
    { v1: 'true', v2: '123', v3: 'qwe', v4: '1q', v5: 'false' },
    { v1: true, v2: 123, v3: 'qwe', v4: '1q', v5: false },
  ],
  [{ v1: 'd' }, { v1: 'd' }],
  [{}, {}],
]

describe('transformQueryParamsObject', () => {
  it.each(transformQueryParamsObjectTests)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = transformQueryParamsObject(reply)
      expect(result).toEqual(expected)
    },
  )
})
