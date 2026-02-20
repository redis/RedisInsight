import {
  getOnboardingSuggestions,
  ONBOARDING_TEMPLATES,
} from './onboardingSuggestions'

const EXPECTED_COMMANDS = [
  'FT.SEARCH',
  'FT.AGGREGATE',
  'FT.SUGGET',
  'FT.SPELLCHECK',
  'FT.EXPLAIN',
  'FT.PROFILE',
  'FT._LIST',
]

describe('getOnboardingSuggestions', () => {
  it('should return one suggestion per onboarding template', () => {
    const suggestions = getOnboardingSuggestions()

    expect(suggestions).toHaveLength(ONBOARDING_TEMPLATES.length)
  })

  it('should contain the expected FT.* commands', () => {
    const suggestions = getOnboardingSuggestions()
    const labels = suggestions.map((s) => s.label)

    expect(labels).toEqual(EXPECTED_COMMANDS)
  })

  it('should include a detail description for every suggestion', () => {
    const suggestions = getOnboardingSuggestions()

    suggestions.forEach((s) => {
      expect(s.detail).toBeTruthy()
    })
  })

  it('should include documentation for every suggestion', () => {
    const suggestions = getOnboardingSuggestions()

    suggestions.forEach((s) => {
      expect(s.documentation).toBeTruthy()
    })
  })

  it('should use generic index placeholder when no indexes provided', () => {
    const suggestions = getOnboardingSuggestions()
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    expect(ftSearch?.insertText).toContain('${1:index}')
  })

  it('should preselect first available index in snippet when indexes exist', () => {
    const mockIndexes = [{ data: Buffer.from('my-idx'), type: 'Buffer' }] as any

    const suggestions = getOnboardingSuggestions(mockIndexes)
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    expect(ftSearch?.insertText).toContain('my-idx')
  })

  it('should prefer activeIndexName over the first index in the list', () => {
    const mockIndexes = [
      { data: Buffer.from('first-idx'), type: 'Buffer' },
    ] as any

    const suggestions = getOnboardingSuggestions(mockIndexes, 'active-idx')
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    expect(ftSearch?.insertText).toContain('active-idx')
    expect(ftSearch?.insertText).not.toContain('first-idx')
  })

  it('should use activeIndexName even when no indexes array is provided', () => {
    const suggestions = getOnboardingSuggestions([], 'active-idx')
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    expect(ftSearch?.insertText).toContain('active-idx')
  })

  it('should insert activeIndexName as fixed text so Tab jumps to query', () => {
    const suggestions = getOnboardingSuggestions([], 'active-idx')
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    // Index is plain text, not a tab-stop
    expect(ftSearch?.insertText).toContain("'active-idx'")
    expect(ftSearch?.insertText).not.toContain('${1:active-idx}')
    // Query placeholder is ${1:...} (first tab-stop)
    expect(ftSearch?.insertText).toContain('"${1:*}"')
  })

  it('should use editable tab-stop for index when no activeIndexName', () => {
    const mockIndexes = [{ data: Buffer.from('my-idx'), type: 'Buffer' }] as any
    const suggestions = getOnboardingSuggestions(mockIndexes)
    const ftSearch = suggestions.find((s) => s.label === 'FT.SEARCH')

    // Index is tab-stop 1, query is tab-stop 2
    expect(ftSearch?.insertText).toContain('${1:my-idx}')
    expect(ftSearch?.insertText).toContain('"${2:*}"')
  })

  it('should not include index placeholder for non-index commands', () => {
    const suggestions = getOnboardingSuggestions()
    const ftList = suggestions.find((s) => s.label === 'FT._LIST')

    expect(ftList?.insertText).toBe('FT._LIST')
  })

  it('should sort templates before regular commands via sortText', () => {
    const suggestions = getOnboardingSuggestions()

    suggestions.forEach((s) => {
      expect(s.sortText).toMatch(/^!/)
    })
  })
})
