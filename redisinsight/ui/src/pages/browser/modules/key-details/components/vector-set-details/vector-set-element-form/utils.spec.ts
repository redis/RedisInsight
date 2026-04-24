import {
  FP32_INVALID_BYTE_LENGTH_INPUT,
  FP32_VECTOR_FIXTURE_1_2_3,
  vectorSetElementFormStateFactory,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import {
  DEFAULT_VECTOR_HELP_TEXT,
  INVALID_FP32_BYTE_LENGTH_ERROR,
  INVALID_FP32_FORMAT_ERROR,
} from './constants'
import {
  getRowDim,
  getVectorError,
  getVectorFieldInfo,
  isFp32Input,
  isValidElement,
  parseFp32EscapedString,
  parseVector,
  toSubmitElement,
} from './utils'

const {
  bytes: FP32_BYTES_1_2_3,
  escaped: FP32_ESCAPED_1_2_3,
  base64: FP32_BASE64_1_2_3,
} = FP32_VECTOR_FIXTURE_1_2_3

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
      vectorValues: [1, 2, 3],
    })
  })

  it('should map a valid element without attributes', () => {
    expect(toSubmitElement(vectorSetElementFormStateFactory.build())).toEqual({
      name: 'item',
      vectorValues: [1, 2, 3],
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
      vectorValues: [1, 2, 3],
      attributes: '{"a":1}',
    })
  })

  it('should omit attributes when they are whitespace only', () => {
    const result = toSubmitElement(
      vectorSetElementFormStateFactory.build({ attributes: '   ' }),
    )
    expect(result).toEqual({ name: 'item', vectorValues: [1, 2, 3] })
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

  it('should return true for a valid FP32 element with matching dim', () => {
    expect(
      isValidElement(
        vectorSetElementFormStateFactory.build({ vector: FP32_ESCAPED_1_2_3 }),
        3,
      ),
    ).toBe(true)
  })
})

describe('isFp32Input', () => {
  it('should return false for plain numeric input', () => {
    expect(isFp32Input('1, 2, 3')).toBe(false)
    expect(isFp32Input('')).toBe(false)
  })

  it('should return true when input starts with an `\\xHH` escape', () => {
    expect(isFp32Input(FP32_ESCAPED_1_2_3)).toBe(true)
    expect(isFp32Input('  \\x00\\x01')).toBe(true)
  })

  it('should treat any `\\x` prefix as an FP32 attempt (even when malformed)', () => {
    // So that malformed FP32 inputs surface a format-specific error instead
    // of falling through to the numeric parser as "not a number".
    expect(isFp32Input('\\xG0')).toBe(true)
    expect(isFp32Input('\\x')).toBe(true)
  })

  it('should return false for inputs that do not start with `\\x`', () => {
    expect(isFp32Input('x00')).toBe(false)
    expect(isFp32Input('0x00')).toBe(false)
  })
})

describe('parseFp32EscapedString', () => {
  it('should return null for an empty/whitespace string', () => {
    expect(parseFp32EscapedString('')).toBeNull()
    expect(parseFp32EscapedString('   ')).toBeNull()
  })

  it('should return null when the string does not match the full escape regex', () => {
    expect(parseFp32EscapedString('\\x00 hello')).toBeNull()
    expect(parseFp32EscapedString('\\xZZ')).toBeNull()
  })

  it('should decode a valid escaped-byte string', () => {
    const bytes = parseFp32EscapedString(FP32_ESCAPED_1_2_3)
    expect(bytes).not.toBeNull()
    expect(Array.from(bytes as Uint8Array)).toEqual(FP32_BYTES_1_2_3)
  })

  it('should tolerate whitespace between escape tokens', () => {
    const spaced = FP32_ESCAPED_1_2_3.replace(/\\x/g, ' \\x')
    const bytes = parseFp32EscapedString(spaced)
    expect(bytes).not.toBeNull()
    expect(Array.from(bytes as Uint8Array)).toEqual(FP32_BYTES_1_2_3)
  })
})

describe('getRowDim', () => {
  it('should return undefined for an empty/invalid input', () => {
    expect(getRowDim('')).toBeUndefined()
    expect(getRowDim('1, abc')).toBeUndefined()
  })

  it('should return the numeric length for a numeric input', () => {
    expect(getRowDim('1, 2, 3, 4')).toBe(4)
  })

  it('should return bytes/4 for a valid FP32 input', () => {
    expect(getRowDim(FP32_ESCAPED_1_2_3)).toBe(3)
  })

  it('should return undefined for an FP32 input with invalid byte length', () => {
    expect(getRowDim(FP32_INVALID_BYTE_LENGTH_INPUT)).toBeUndefined()
  })
})

describe('FP32 detection in getVectorError', () => {
  it('should return undefined for a valid FP32 input', () => {
    expect(getVectorError(FP32_ESCAPED_1_2_3)).toBeUndefined()
  })

  it('should return the FP32 byte-length error when bytes are not a multiple of 4', () => {
    expect(getVectorError(FP32_INVALID_BYTE_LENGTH_INPUT)).toBe(
      INVALID_FP32_BYTE_LENGTH_ERROR,
    )
  })

  it('should return the FP32 format error for stray hex characters', () => {
    expect(getVectorError('\\xZZ')).toBe(INVALID_FP32_FORMAT_ERROR)
  })

  it('should return a dimension-mismatch error when FP32 dim disagrees', () => {
    expect(getVectorError(FP32_ESCAPED_1_2_3, 5)).toBe(
      'Dimension mismatch. Expected 5 values, but received 3',
    )
  })
})

describe('FP32 detection in getVectorFieldInfo', () => {
  it('should return the FP32 detected message for a valid FP32 input', () => {
    expect(getVectorFieldInfo(FP32_ESCAPED_1_2_3)).toEqual({
      text: 'Detected FP32 vector (3 dimensions).',
      isError: false,
    })
  })

  it('should return the FP32 byte-length error in the hint', () => {
    expect(getVectorFieldInfo(FP32_INVALID_BYTE_LENGTH_INPUT)).toEqual({
      text: INVALID_FP32_BYTE_LENGTH_ERROR,
      isError: true,
    })
  })
})

describe('FP32 detection in toSubmitElement', () => {
  it('should produce a `vectorFp32` base64 payload for a valid FP32 input', () => {
    const result = toSubmitElement(
      vectorSetElementFormStateFactory.build({
        vector: FP32_ESCAPED_1_2_3,
      }),
    )
    expect(result).toEqual({
      name: 'item',
      vectorFp32: FP32_BASE64_1_2_3,
    })
    expect(result).not.toHaveProperty('vectorValues')
  })

  it('should include attributes alongside the vectorFp32 payload', () => {
    const result = toSubmitElement(
      vectorSetElementFormStateFactory.build({
        vector: FP32_ESCAPED_1_2_3,
        attributes: '{"a":1}',
      }),
    )
    expect(result).toEqual({
      name: 'item',
      vectorFp32: FP32_BASE64_1_2_3,
      attributes: '{"a":1}',
    })
  })

  it('should return null when the FP32 byte length is invalid', () => {
    expect(
      toSubmitElement(
        vectorSetElementFormStateFactory.build({
          vector: FP32_INVALID_BYTE_LENGTH_INPUT,
        }),
      ),
    ).toBeNull()
  })
})
