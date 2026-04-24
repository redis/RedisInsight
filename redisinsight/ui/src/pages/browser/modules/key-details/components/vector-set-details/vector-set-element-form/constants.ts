import { IVectorSetElementState } from './interfaces'

export const INITIAL_VECTOR_SET_ELEMENT_STATE: IVectorSetElementState = {
  id: 0,
  name: '',
  vector: '',
  attributes: '',
  showAttributes: false,
}

export const VECTOR_SEPARATOR = /[\s,]+/

// Matches an FP32 escaped-byte string: one or more `\xHH` tokens (optionally
// separated by whitespace). Validates the full input end-to-end, used only for
// format detection and parsing of the binary FP32 VADD payload.
export const FP32_ESCAPE_REGEX = /^(?:\s*\\x[0-9a-fA-F]{2})+\s*$/

// Partial match used for cheap `isFp32Input` detection - any `\x` occurrence
// at the start of the trimmed input commits the caller to the FP32 branch, so
// that malformed FP32 tokens (e.g. `\xZZ`) surface a format-specific error
// instead of leaking through to the numeric parser as "not a number".
export const FP32_ESCAPE_PREFIX_REGEX = /^\\x/

export const DEFAULT_VECTOR_HELP_TEXT =
  'Format is detected automatically. The first vector defines the required dimension for this set.'

export const INVALID_FP32_FORMAT_ERROR = 'Invalid FP32 byte string'
export const INVALID_FP32_BYTE_LENGTH_ERROR =
  'FP32 byte length must be a multiple of 4'
export const INVALID_NUMERIC_FORMAT_ERROR = 'Invalid number format in vector'
