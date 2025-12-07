import { formatLongName, formatNameShort } from 'uiSrc/utils'

const formatLongNameTests: any[] = [
  ['11111111111112', 7, 1, '...', '111...2'],
  ['uaoe uaoeu aoeuaoeua', 7, 1, ' ... ', 'u ... a'],
  ['u aoeu aoeuaoeuaoeuaoe eoua uoaeu aoeu', 10, 3, ';', 'u aoeu;oeu'],
]

describe('formatLongName', () => {
  it.each(formatLongNameTests)(
    'for input: %s (name), %s (maxNameLength), %s (endPartLength), %s (separator), should be output: %s',
    (name, maxNameLength, endPartLength, separator, expected) => {
      const result = formatLongName(
        name,
        maxNameLength,
        endPartLength,
        separator,
      )
      expect(result).toBe(expected)
    },
  )
})

const formatNameShortTests: any[] = [
  ['11111111111112', '11111111111112'],
  ['uaoe uaoeu aoeuaoeua', 'uaoe uaoeu aoeuaoeua'],
  [
    'test test test test test test test test test test test test test test test test test test test ',
    'test test test test test test test test test test ...test test test ',
  ],
]

describe('formatNameShort', () => {
  it.each(formatNameShortTests)(
    'for input: %s (name), should be output: %s',
    (name, expected) => {
      const result = formatNameShort(name)
      expect(result).toBe(expected)
    },
  )
})
