import { getFormatTime } from '../monitorUtils'

const getOutputForFormatTime: any[] = [
  [undefined, 'Invalid time'],
  [null, 'Invalid time'],
  [{}, 'Invalid time'],
  ['oeuoeu', 'Invalid time'],
  [1, 'Invalid time'],
  [11641450853, 'Invalid time'],
  ['1641450853.668074[0', 'Invalid time'],
  ['1641450853.668074', ':34:13.668'],
  ['1641450854.612083', ':34:14.612'],
  ['1641450856.616102', ':34:16.616'],
  ['1641450858.616121', ':34:18.616'],
]

describe('formatToText', () => {
  it.each(getOutputForFormatTime)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getFormatTime(reply)
      expect(result).toContain(expected)
    },
  )
})
