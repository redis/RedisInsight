import { VECTOR_SEPARATOR, DEFAULT_VECTOR_HELP_TEXT } from './constants'
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

function validateVector(
  raw: string,
  vectorDim?: number,
): VectorValidationResult {
  if (!raw.trim()) return { parsed: null }

  const parsed = parseVector(raw)
  if (!parsed) return { parsed: null, error: 'Invalid number format in vector' }

  if (vectorDim !== undefined && parsed.length !== vectorDim) {
    return {
      parsed,
      error: `Dimension mismatch. Expected ${vectorDim} values, but received ${parsed.length}`,
    }
  }

  return { parsed }
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
  const { parsed, error } = validateVector(raw, vectorDim)
  return !error && parsed ? parsed : null
}

export function isValidElement(
  el: IVectorSetElementState,
  vectorDim?: number,
): boolean {
  return !!el.name.trim() && getValidVector(el.vector, vectorDim) !== null
}

export function toSubmitElement(
  el: IVectorSetElementState,
  vectorDim?: number,
): SubmitElement | null {
  const name = el.name.trim()
  if (!name) return null

  const vector = getValidVector(el.vector, vectorDim)
  if (!vector) return null

  const item: SubmitElement = { name, vector }
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

  const { parsed, error } = validateVector(raw, vectorDim)
  if (error) {
    return { text: error, isError: true }
  }

  return {
    text: `Detected numeric vector (${parsed!.length} dimensions).`,
    isError: false,
  }
}
