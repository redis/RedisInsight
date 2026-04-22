import { vectorSetElementFormStateFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { DEFAULT_VECTOR_HELP_TEXT } from './constants'
import {
  getValidVector,
  getVectorError,
  getVectorFieldInfo,
  isValidElement,
  parseVector,
  toSubmitElement,
} from './utils'

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

describe('getValidVector', () => {
  it('should return null for an empty string', () => {
    expect(getValidVector('')).toBeNull()
    expect(getValidVector('   ')).toBeNull()
  })

  it('should return null for an unparsable vector', () => {
    expect(getValidVector('1, abc, 3')).toBeNull()
  })

  it('should return the parsed vector without dimension check', () => {
    expect(getValidVector('1, 2, 3')).toEqual([1, 2, 3])
  })

  it('should return the parsed vector when dimension matches', () => {
    expect(getValidVector('1, 2, 3', 3)).toEqual([1, 2, 3])
  })

  it('should return null when dimension does not match', () => {
    expect(getValidVector('1, 2', 3)).toBeNull()
  })
})

describe('toSubmitElement', () => {
  it('should return null when the vector is invalid', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({ vector: '1, abc' }),
      ),
    ).toBeNull()
  })

  it('should return null when the vector dimension does not match', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({ vector: '1, 2' }),
        3,
      ),
    ).toBeNull()
  })

  it('should return null when the name is empty', () => {
    expect(
      toSubmitElement(vectorSetElementFormStateFactory.build({ name: '' })),
    ).toBeNull()
  })

  it('should return null when the name is whitespace-only', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({ name: '   \t  ' }),
      ),
    ).toBeNull()
  })

  it('should trim the name in the submitted payload', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({ name: '  padded  ' }),
      ),
    ).toEqual({
      name: 'padded',
      vector: [1, 2, 3],
    })
  })

  it('should map a valid element without attributes', () => {
    expect(toSubmitElement(vectorSetElementFormStateFactory.build())).toEqual({
      name: 'item',
      vector: [1, 2, 3],
    })
  })

  it('should include trimmed attributes when provided', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({
          attributes: '  {"a":1}  ',
        }),
      ),
    ).toEqual({
      name: 'item',
      vector: [1, 2, 3],
      attributes: '{"a":1}',
    })
  })

  it('should omit attributes when they are whitespace only', () => {
    const result = toSubmitElement(
      vectorSetElementFormStateFactory.build({ attributes: '   ' }),
    )
    expect(result).toEqual({ name: 'item', vector: [1, 2, 3] })
    expect(result).not.toHaveProperty('attributes')
  })
})

describe('isValidElement', () => {
  it('should return false for an empty name', () => {
    expect(
      isValidElement(vectorSetElementFormStateFactory.build({ name: '' })),
    ).toBe(false)
  })

  it('should return false for a whitespace-only name', () => {
    expect(
      isValidElement(
        vectorSetElementFormStateFactory.build({ name: '   \t  ' }),
      ),
    ).toBe(false)
  })

  it('should return false for an invalid vector', () => {
    expect(
      isValidElement(
        vectorSetElementFormStateFactory.build({ vector: '1, abc' }),
      ),
    ).toBe(false)
  })

  it('should return false when the vector dimension does not match', () => {
    expect(
      isValidElement(
        vectorSetElementFormStateFactory.build({ vector: '1, 2' }),
        3,
      ),
    ).toBe(false)
  })

  it('should return true for a valid element', () => {
    expect(isValidElement(vectorSetElementFormStateFactory.build())).toBe(true)
  })
})
