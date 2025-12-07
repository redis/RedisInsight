import { getRdiUrl } from 'uiSrc/utils'

const getRdiUrlTests: [string[], string][] = [
  [[], '/rdi/'],
  [[''], '/rdi/'],
  [['sub_path'], '/rdi/sub_path'],
  [['path1', 'path2'], '/rdi/path1/path2'],
  [['path1', 'path2', 'path3'], '/rdi/path1/path2/path3'],
]

describe('getRdiUrl', () => {
  it.each(getRdiUrlTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = getRdiUrl(...input)
      expect(result).toBe(expected)
    },
  )
})
