import { VECTOR_SEPARATOR, DEFAULT_VECTOR_HELP_TEXT } from './constants'
import { VectorFieldInfo } from './interfaces'

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

export function getVectorError(
  raw: string,
  vectorDim?: number,
): string | undefined {
  if (!raw.trim()) return undefined

  const parsed = parseVector(raw)
  if (!parsed) return 'Invalid number format in vector'

  if (vectorDim !== undefined && parsed.length !== vectorDim) {
    return `Dimension mismatch. Expected ${vectorDim} values, but received ${parsed.length}`
  }

  return undefined
}

export function getVectorFieldInfo(
  raw: string,
  vectorDim?: number,
): VectorFieldInfo {
  const trimmed = raw.trim()

  if (!trimmed) {
    return { text: DEFAULT_VECTOR_HELP_TEXT, isError: false }
  }

  const error = getVectorError(raw, vectorDim)
  if (error) {
    return { text: error, isError: true }
  }

  const parsed = parseVector(raw)
  if (parsed) {
    return {
      text: `Detected numeric vector (${parsed.length} dimensions).`,
      isError: false,
    }
  }

  return { text: '', isError: false }
}
