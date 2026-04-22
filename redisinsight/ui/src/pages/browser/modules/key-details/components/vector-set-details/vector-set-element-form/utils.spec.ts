import { DEFAULT_VECTOR_HELP_TEXT } from './constants'
import { getVectorError, getVectorFieldInfo, parseVector } from './utils'

describe('parseVector', () => {
  it('should return null for an empty string', () => {
    expect(parseVector('')).toBeNull()
  })

  it('should return null for a whitespace-only string', () => {
    expect(parseVector('   \t  ')).toBeNull()
  })

  it('should parse a comma-separated list of numbers', () => {
    expect(parseVector('1, 2.5, -3')).toEqual([1, 2.5, -3])
  })

  it('should parse a whitespace-separated list of numbers', () => {
    expect(parseVector('1 2 3')).toEqual([1, 2, 3])
  })

  it('should ignore leading/trailing separators and empty segments', () => {
    expect(parseVector(' , 1 ,, 2 , 3 , ')).toEqual([1, 2, 3])
  })

  it('should return null when any token is not a finite number', () => {
    expect(parseVector('1, abc, 3')).toBeNull()
    expect(parseVector('1, Infinity, 3')).toBeNull()
    expect(parseVector('1, NaN, 3')).toBeNull()
  })

  it('should return null when no numeric tokens are present', () => {
    expect(parseVector(', ,')).toBeNull()
  })
})

describe('getVectorError', () => {
  it('should return undefined for an empty string', () => {
    expect(getVectorError('')).toBeUndefined()
    expect(getVectorError('   ')).toBeUndefined()
  })

  it('should return an error for an unparsable vector', () => {
    expect(getVectorError('1, abc, 3')).toBe('Invalid number format in vector')
  })

  it('should return undefined for a valid vector without dimension check', () => {
    expect(getVectorError('1, 2, 3')).toBeUndefined()
  })

  it('should return undefined when dimension matches', () => {
    expect(getVectorError('1, 2, 3', 3)).toBeUndefined()
  })

  it('should return a dimension-mismatch error when dimension does not match', () => {
    expect(getVectorError('1, 2', 3)).toBe(
      'Dimension mismatch. Expected 3 values, but received 2',
    )
  })
})

describe('getVectorFieldInfo', () => {
  it('should return the default help text for an empty input', () => {
    expect(getVectorFieldInfo('')).toEqual({
      text: DEFAULT_VECTOR_HELP_TEXT,
      isError: false,
    })
  })

  it('should return an error message when parsing fails', () => {
    expect(getVectorFieldInfo('1, abc, 3')).toEqual({
      text: 'Invalid number format in vector',
      isError: true,
    })
  })

  it('should return a dimension-mismatch error when dimension does not match', () => {
    expect(getVectorFieldInfo('1, 2', 3)).toEqual({
      text: 'Dimension mismatch. Expected 3 values, but received 2',
      isError: true,
    })
  })

  it('should return detected dimensions for a valid vector', () => {
    expect(getVectorFieldInfo('1, 2, 3')).toEqual({
      text: 'Detected numeric vector (3 dimensions).',
      isError: false,
    })
  })

  it('should return detected dimensions when dimension matches', () => {
    expect(getVectorFieldInfo('1 2 3 4', 4)).toEqual({
      text: 'Detected numeric vector (4 dimensions).',
      isError: false,
    })
  })
})
