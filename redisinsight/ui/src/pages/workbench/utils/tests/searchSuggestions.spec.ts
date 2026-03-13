import { IRedisCommand, ICommandTokenType } from 'uiSrc/constants'
import { REDIS_OPEN_TIMESTAMP_PICKER_COMMAND } from 'uiSrc/pages/workbench/constants'
import { findSuggestionsByArg } from 'uiSrc/pages/workbench/utils/searchSuggestions'

const mockCommandsWithUnixTime: IRedisCommand[] = [
  {
    token: 'EXPIREAT',
    arguments: [
      { token: 'key', type: ICommandTokenType.Key },
      { name: 'timestamp', type: ICommandTokenType.UnixTime },
    ],
  },
  {
    token: 'GET',
    arguments: [{ token: 'key', type: ICommandTokenType.Key }],
  },
]

const cursorContext = {
  prevCursorChar: ' ',
  nextCursorChar: '',
  isCursorInQuotes: false,
  currentOffsetArg: '',
  offset: 0,
  argLeftOffset: 0,
  argRightOffset: 0,
  range: {
    startLineNumber: 1,
    startColumn: 15,
    endLineNumber: 1,
    endColumn: 15,
  },
}

describe('findSuggestionsByArg', () => {
  describe('non-RediSearch commands with unix-time argument', () => {
    it('should return "Insert timestamp..." suggestion when cursor is on unix-time arg', () => {
      const command = {
        name: 'EXPIREAT',
        info: mockCommandsWithUnixTime[0],
        commandQuery: 'EXPIREAT mykey ',
        allArgs: ['EXPIREAT', 'mykey', ''],
        args: [['EXPIREAT', 'mykey'], ['']],
        commandCursorPosition: 0,
        cursor: {
          ...cursorContext,
          prevCursorChar: ' ',
        },
      }

      const result = findSuggestionsByArg(
        mockCommandsWithUnixTime,
        command as any,
        cursorContext as any,
        {},
      )

      expect(result.suggestions.data).toHaveLength(1)
      expect(result.suggestions.data[0]).toMatchObject({
        label: 'Insert timestamp...',
        command: {
          id: REDIS_OPEN_TIMESTAMP_PICKER_COMMAND,
          title: 'Open date/time picker',
        },
      })
      expect(result.helpWidget?.isOpen).toBe(true)
      expect(result.helpWidget?.data?.currentArg?.type).toBe(
        ICommandTokenType.UnixTime,
      )
    })

    it('should return empty suggestions when cursor is not on unix-time arg', () => {
      const command = {
        name: 'EXPIREAT',
        info: mockCommandsWithUnixTime[0],
        commandQuery: 'EXPIREAT ',
        allArgs: ['EXPIREAT', ''],
        args: [['EXPIREAT'], ['']],
        commandCursorPosition: 0,
        cursor: { ...cursorContext },
      }

      const result = findSuggestionsByArg(
        mockCommandsWithUnixTime,
        command as any,
        cursorContext as any,
        {},
      )

      expect(result.suggestions.data).toHaveLength(0)
      expect(result.helpWidget?.isOpen).toBe(true)
    })

    it('should return empty suggestions for command without unix-time args', () => {
      const command = {
        name: 'GET',
        info: mockCommandsWithUnixTime[1],
        commandQuery: 'GET ',
        allArgs: ['GET', ''],
        args: [['GET'], ['']],
        commandCursorPosition: 0,
        cursor: { ...cursorContext },
      }

      const result = findSuggestionsByArg(
        mockCommandsWithUnixTime,
        command as any,
        cursorContext as any,
        {},
      )

      expect(result.suggestions.data).toHaveLength(0)
    })
  })
})
