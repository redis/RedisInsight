import { VectorEmbeddingRange } from './vectorEmbeddingUtils.types'

/**
 * Session-scoped store behind collapsed vector embeddings: collapsing swaps the
 * embedding text for a placeholder carrying an id, and the full value is kept
 * here. Placeholders only resolve within the session, so every exit path
 * (submit, copy, save) must expand before persisting.
 */

// Matches e.g. "[▸ vector · 1536 dims #3]".
const PLACEHOLDER_REGEX = /\[▸ vector · (\d+) dims #(\d+)\]/g

interface StoredEmbedding {
  value: string
  byteSize: number
}

let nextPlaceholderId = 1
const collapsedValues = new Map<number, StoredEmbedding>()

export interface VectorEmbeddingPlaceholder {
  id: number
  dimensions: number
  /** Byte size of the stored value; undefined when the value is unknown. */
  byteSize?: number
  /** Character range of the whole placeholder within the scanned text. */
  range: VectorEmbeddingRange
}

export const buildVectorEmbeddingPlaceholder = (
  id: number,
  dimensions: number,
): string => `[▸ vector · ${dimensions} dims #${id}]`

/** Stores the full embedding text and returns the placeholder replacing it. */
export const collapseVectorEmbeddingValue = (
  value: string,
  dimensions: number,
  byteSize: number,
): string => {
  const id = nextPlaceholderId
  nextPlaceholderId += 1
  collapsedValues.set(id, { value, byteSize })
  return buildVectorEmbeddingPlaceholder(id, dimensions)
}

export const getVectorEmbeddingValue = (id: number): string | undefined =>
  collapsedValues.get(id)?.value

/** Finds every embedding placeholder in the text, ordered by position. */
export const findVectorEmbeddingPlaceholders = (
  text: string,
): VectorEmbeddingPlaceholder[] => {
  const placeholders: VectorEmbeddingPlaceholder[] = []

  const regex = new RegExp(PLACEHOLDER_REGEX)
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    const id = Number(match[2])
    const start = match.index

    placeholders.push({
      id,
      dimensions: Number(match[1]),
      byteSize: collapsedValues.get(id)?.byteSize,
      range: { start, end: start + match[0].length },
    })
  }

  return placeholders
}

/**
 * Replaces every known placeholder with its stored full value. Placeholders
 * whose value is unknown are left untouched so the problem stays visible.
 */
export const expandVectorEmbeddings = (text: string): string =>
  text.replace(
    new RegExp(PLACEHOLDER_REGEX),
    (placeholder, _dimensions: string, id: string) =>
      collapsedValues.get(Number(id))?.value ?? placeholder,
  )

/** Test helper: clears stored values and restarts id numbering. */
export const resetVectorEmbeddingPlaceholders = (): void => {
  nextPlaceholderId = 1
  collapsedValues.clear()
}
