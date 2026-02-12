import {
  parseExplainableCommand,
  buildExplainQuery,
  buildProfileQuery,
  extractFirstToken,
} from './QueryEditor.utils'

describe('parseExplainableCommand', () => {
  it('detects FT.SEARCH', () => {
    const result = parseExplainableCommand('FT.SEARCH idx "*"')
    expect(result).toEqual({ command: 'FT.SEARCH', afterCommand: ' idx "*"' })
  })

  it('detects FT.AGGREGATE', () => {
    const result = parseExplainableCommand('FT.AGGREGATE idx "*"')
    expect(result).toEqual({
      command: 'FT.AGGREGATE',
      afterCommand: ' idx "*"',
    })
  })

  it('is case-insensitive', () => {
    const result = parseExplainableCommand('ft.search idx "*"')
    expect(result).toEqual({ command: 'FT.SEARCH', afterCommand: ' idx "*"' })
  })

  it('returns null for non-matching commands', () => {
    expect(parseExplainableCommand('GET key')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseExplainableCommand('')).toBeNull()
  })

  it('handles command with no args', () => {
    const result = parseExplainableCommand('FT.SEARCH')
    expect(result).toEqual({ command: 'FT.SEARCH', afterCommand: '' })
  })
})

describe('buildExplainQuery', () => {
  it('builds FT.EXPLAIN from FT.SEARCH', () => {
    const result = buildExplainQuery({
      command: 'FT.SEARCH',
      afterCommand: ' idx "*"',
    })
    expect(result).toBe('FT.EXPLAIN idx "*"')
  })

  it('builds FT.EXPLAIN from FT.AGGREGATE', () => {
    const result = buildExplainQuery({
      command: 'FT.AGGREGATE',
      afterCommand: ' idx "*" GROUPBY 1 @field',
    })
    expect(result).toBe('FT.EXPLAIN idx "*" GROUPBY 1 @field')
  })
})

describe('buildProfileQuery', () => {
  it('builds FT.PROFILE from FT.SEARCH with unquoted index', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: ' idx "*" LIMIT 0 10',
    })
    expect(result).toBe('FT.PROFILE idx SEARCH QUERY "*" LIMIT 0 10')
  })

  it('builds FT.PROFILE from FT.AGGREGATE with unquoted index', () => {
    const result = buildProfileQuery({
      command: 'FT.AGGREGATE',
      afterCommand: ' idx "*" GROUPBY 1 @field',
    })
    expect(result).toBe('FT.PROFILE idx AGGREGATE QUERY "*" GROUPBY 1 @field')
  })

  it('handles index-only (no query args)', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: ' idx',
    })
    expect(result).toBe('FT.PROFILE idx SEARCH QUERY')
  })

  it('handles double-quoted index with spaces', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: ' "my idx" "*"',
    })
    expect(result).toBe('FT.PROFILE "my idx" SEARCH QUERY "*"')
  })

  it('handles single-quoted index with spaces', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: " 'my idx' '*'",
    })
    expect(result).toBe("FT.PROFILE 'my idx' SEARCH QUERY '*'")
  })

  it('handles quoted index with escaped quotes inside', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: ' "my\\"idx" "*"',
    })
    expect(result).toBe('FT.PROFILE "my\\"idx" SEARCH QUERY "*"')
  })

  it('handles quoted index-only (no query args)', () => {
    const result = buildProfileQuery({
      command: 'FT.SEARCH',
      afterCommand: ' "my idx"',
    })
    expect(result).toBe('FT.PROFILE "my idx" SEARCH QUERY')
  })

  it('handles FT.AGGREGATE with quoted index', () => {
    const result = buildProfileQuery({
      command: 'FT.AGGREGATE',
      afterCommand: ' "my idx" "*" GROUPBY 1 @f',
    })
    expect(result).toBe('FT.PROFILE "my idx" AGGREGATE QUERY "*" GROUPBY 1 @f')
  })
})

describe('extractFirstToken', () => {
  it('extracts unquoted token', () => {
    expect(extractFirstToken('idx "*"')).toEqual({
      index: 'idx',
      remainder: ' "*"',
    })
  })

  it('extracts double-quoted token with spaces', () => {
    expect(extractFirstToken('"my idx" "*"')).toEqual({
      index: '"my idx"',
      remainder: ' "*"',
    })
  })

  it('extracts single-quoted token with spaces', () => {
    expect(extractFirstToken("'my idx' '*'")).toEqual({
      index: "'my idx'",
      remainder: " '*'",
    })
  })

  it('handles token with escaped quote inside', () => {
    expect(extractFirstToken('"my\\"idx" rest')).toEqual({
      index: '"my\\"idx"',
      remainder: ' rest',
    })
  })

  it('handles single token (no remainder)', () => {
    expect(extractFirstToken('idx')).toEqual({
      index: 'idx',
      remainder: null,
    })
  })

  it('handles quoted single token (no remainder)', () => {
    expect(extractFirstToken('"my idx"')).toEqual({
      index: '"my idx"',
      remainder: null,
    })
  })

  it('handles empty string', () => {
    expect(extractFirstToken('')).toEqual({ index: '', remainder: null })
  })

  it('handles unterminated quote', () => {
    expect(extractFirstToken('"unterminated')).toEqual({
      index: '"unterminated',
      remainder: null,
    })
  })
})
