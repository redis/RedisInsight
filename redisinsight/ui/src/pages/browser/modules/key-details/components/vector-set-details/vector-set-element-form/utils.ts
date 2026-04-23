import {
  DEFAULT_VECTOR_HELP_TEXT,
  FP32_ESCAPE_PREFIX_REGEX,
  FP32_ESCAPE_REGEX,
  INVALID_FP32_BYTE_LENGTH_ERROR,
  INVALID_FP32_FORMAT_ERROR,
  INVALID_NUMERIC_FORMAT_ERROR,
  VECTOR_SEPARATOR,
} from './constants'
import {
  IVectorSetElementState,
  SubmitElement,
  VectorFieldInfo,
  VectorValidationResult,
} from './interfaces'

export function parseVector(raw: string): number[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const parts = trimmed.split(VECTOR_SEPARATOR).filter(Boolean)
  const nums: number[] = []

  for (const part of parts) {
    const n = Number(part)
    if (!Number.isFinite(n)) return null
    nums.push(n)
  }

  return nums.length > 0 ? nums : null
}

export function isFp32Input(raw: string): boolean {
  return FP32_ESCAPE_PREFIX_REGEX.test(raw.trim())
}

export function parseFp32EscapedString(raw: string): Uint8Array | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!FP32_ESCAPE_REGEX.test(trimmed)) return null

  const matches = trimmed.match(/\\x([0-9a-fA-F]{2})/g)
  if (!matches || matches.length === 0) return null

  const bytes = new Uint8Array(matches.length)
  for (let i = 0; i < matches.length; i += 1) {
    bytes[i] = parseInt(matches[i].slice(2), 16)
  }
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function validateVector(
  raw: string,
  vectorDim?: number,
): VectorValidationResult {
  if (!raw.trim()) return {}

  if (isFp32Input(raw)) {
    const bytes = parseFp32EscapedString(raw)
    if (!bytes) return { error: INVALID_FP32_FORMAT_ERROR }
    if (bytes.length === 0 || bytes.length % 4 !== 0) {
      return { error: INVALID_FP32_BYTE_LENGTH_ERROR }
    }
    const dim = bytes.length / 4
    if (vectorDim !== undefined && dim !== vectorDim) {
      return {
        kind: 'fp32',
        fp32Bytes: bytes,
        dim,
        error: `Dimension mismatch. Expected ${vectorDim} values, but received ${dim}`,
      }
    }
    return { kind: 'fp32', fp32Bytes: bytes, dim }
  }

  const parsed = parseVector(raw)
  if (!parsed) return { error: INVALID_NUMERIC_FORMAT_ERROR }

  if (vectorDim !== undefined && parsed.length !== vectorDim) {
    return {
      kind: 'numeric',
      numeric: parsed,
      dim: parsed.length,
      error: `Dimension mismatch. Expected ${vectorDim} values, but received ${parsed.length}`,
    }
  }

  return { kind: 'numeric', numeric: parsed, dim: parsed.length }
}

export function getVectorError(
  raw: string,
  vectorDim?: number,
): string | undefined {
  return validateVector(raw, vectorDim).error
}

export function getValidVector(
  raw: string,
  vectorDim?: number,
): number[] | null {
  const result = validateVector(raw, vectorDim)
  if (result.error || result.kind !== 'numeric' || !result.numeric) return null
  return result.numeric
}

/**
 * Returns the detected dimension of the row's vector input regardless of format
 * (numeric `number[]` or FP32 byte blob). Used to infer the required dimension
 * for subsequent rows when creating a new vector set.
 */
export function getRowDim(raw: string): number | undefined {
  const result = validateVector(raw)
  return result.dim
}

export function isValidElement(
  el: IVectorSetElementState,
  vectorDim?: number,
): boolean {
  if (!el.name.trim()) return false
  const result = validateVector(el.vector, vectorDim)
  return !result.error && result.kind !== undefined
}

export function toSubmitElement(
  el: IVectorSetElementState,
  vectorDim?: number,
): SubmitElement | null {
  const name = el.name.trim()
  if (!name) return null

  const result = validateVector(el.vector, vectorDim)
  if (result.error || !result.kind) return null

  const item: SubmitElement = { name }
  if (result.kind === 'fp32' && result.fp32Bytes) {
    item.vectorFp32 = bytesToBase64(result.fp32Bytes)
  } else if (result.kind === 'numeric' && result.numeric) {
    item.vectorValues = result.numeric
  } else {
    return null
  }

  const trimmedAttributes = el.attributes.trim()
  if (trimmedAttributes) item.attributes = trimmedAttributes

  return item
}

export function getVectorFieldInfo(
  raw: string,
  vectorDim?: number,
): VectorFieldInfo {
  if (!raw.trim()) {
    return { text: DEFAULT_VECTOR_HELP_TEXT, isError: false }
  }

  const result = validateVector(raw, vectorDim)
  if (result.error) {
    return { text: result.error, isError: true }
  }

  if (result.kind === 'fp32') {
    return {
      text: `Detected FP32 vector (${result.dim} dimensions).`,
      isError: false,
    }
  }

  return {
    text: `Detected numeric vector (${result.dim} dimensions).`,
    isError: false,
  }
}
