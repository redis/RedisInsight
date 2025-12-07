import { bulkReplyCommands } from 'uiSrc/constants'
import { formatToText } from 'uiSrc/utils'

const getOutputForFormatToTextTests: any[] = [
  [5, 'GET', '(integer) 5'],
  ['5', 'GET', '"5"'],
  [null, 'GET', '(nil)'],
  [[], 'GET', '(empty list or set)'],
  [['1', '2', '3'], 'GET', '1) "1"\n2) "2"\n3) "3"'],
  ['test\r\ntest', bulkReplyCommands[0], 'test\r\ntest'],
  ['test2\r\ntest2\r\ntest2', bulkReplyCommands[1], 'test2\r\ntest2\r\ntest2'],
]

describe('formatToText', () => {
  it.each(getOutputForFormatToTextTests)(
    'for input: %s (reply), %s (command), should be output: %s',
    (reply, command, expected) => {
      const result = formatToText(reply, command)
      expect(result).toBe(expected)
    },
  )
})
