import {
  findActiveDotToken,
  findUsedAttributeKeys,
} from './FilterInputWithSuggestions.utils'

describe('findActiveDotToken', () => {
  it('returns null when caret is at 0', () => {
    expect(findActiveDotToken('.price', 0)).toBeNull()
  })

  it('detects a token right after a leading dot', () => {
    expect(findActiveDotToken('.pri', 4)).toEqual({
      dotIndex: 0,
      prefix: 'pri',
    })
  })

  it('detects an empty prefix when caret is right after the dot', () => {
    expect(findActiveDotToken('.', 1)).toEqual({ dotIndex: 0, prefix: '' })
  })

  it('detects a token after whitespace', () => {
    expect(findActiveDotToken('a == 1 and .pr', 14)).toEqual({
      dotIndex: 11,
      prefix: 'pr',
    })
  })

  it('returns null when the dot is preceded by a word char (decimal numbers)', () => {
    expect(findActiveDotToken('3.14', 4)).toBeNull()
  })

  it('returns null when there is no dot before caret', () => {
    expect(findActiveDotToken('price > 5', 9)).toBeNull()
  })

  it('returns null when a non-word char sits between the dot and caret', () => {
    expect(findActiveDotToken('.price > 5', 10)).toBeNull()
  })
})

describe('findUsedAttributeKeys', () => {
  it('returns an empty set when there are no dot tokens', () => {
    expect(findUsedAttributeKeys('price > 5')).toEqual(new Set())
  })

  it('collects every fully-typed .attribute token', () => {
    expect(
      findUsedAttributeKeys('.price > 5 and .category == "books"'),
    ).toEqual(new Set(['price', 'category']))
  })

  it('skips decimal numbers (.dot preceded by a word char)', () => {
    expect(findUsedAttributeKeys('rating > 3.14')).toEqual(new Set())
  })

  it('excludes the token at excludeDotIndex', () => {
    expect(findUsedAttributeKeys('.price > 5 and .pr', 15)).toEqual(
      new Set(['price']),
    )
  })
})
