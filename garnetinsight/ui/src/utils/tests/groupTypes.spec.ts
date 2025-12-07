import { CommandGroup, GROUP_TYPES_DISPLAY, KeyTypes } from 'uiSrc/constants'
import { getGroupTypeDisplay, NO_TYPE_NAME } from 'uiSrc/utils'

const getGroupTypeDisplayTests: any[] = [
  [KeyTypes.Hash, GROUP_TYPES_DISPLAY[KeyTypes.Hash]],
  [KeyTypes.ReJSON, GROUP_TYPES_DISPLAY[KeyTypes.ReJSON]],
  [KeyTypes.String, GROUP_TYPES_DISPLAY[KeyTypes.String]],
  [KeyTypes.ZSet, GROUP_TYPES_DISPLAY[KeyTypes.ZSet]],
  [CommandGroup.Connection, GROUP_TYPES_DISPLAY[CommandGroup.Connection]],
  [CommandGroup.HyperLogLog, GROUP_TYPES_DISPLAY[CommandGroup.HyperLogLog]],
  [CommandGroup.CuckooFilter, GROUP_TYPES_DISPLAY[CommandGroup.CuckooFilter]],
  [CommandGroup.PubSub, GROUP_TYPES_DISPLAY[CommandGroup.PubSub]],
  ['Some_group', 'Some group'],
  ['group', 'group'],
  [null, NO_TYPE_NAME],
  ['', NO_TYPE_NAME],
  [undefined, NO_TYPE_NAME],
]

describe('getGroupTypeDisplay', () => {
  it.each(getGroupTypeDisplayTests)(
    'for input: %s (type), should be output: %s',
    (type, expected) => {
      const result = getGroupTypeDisplay(type)
      expect(result).toBe(expected)
    },
  )
})
