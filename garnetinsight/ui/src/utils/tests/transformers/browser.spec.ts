import { comboBoxToArray } from 'uiSrc/utils'

const getOutputForFormatToTextTests: any[] = [
  [[], []],
  [
    [{ label: '123' }, { label: 'test' }],
    ['123', 'test'],
  ],
  [[{ label1: '123' }], []],
  [
    [{ label: '123' }, { label: 'test' }],
    ['123', 'test'],
  ],
]

describe('formatToText', () => {
  it.each(getOutputForFormatToTextTests)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = comboBoxToArray(reply)
      expect(result).toEqual(expected)
    },
  )
})
