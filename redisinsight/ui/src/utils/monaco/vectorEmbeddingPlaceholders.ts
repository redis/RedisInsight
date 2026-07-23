import { VectorEmbeddingRange } from './vectorEmbeddingUtils.types'

// Session-scoped store for collapsed embeddings: the placeholder text carries
// an id and the full value is kept here, so every exit path (submit, copy,
// save) must expand before the query is persisted.

// Matches e.g. "[▸ vector · 1536 dims #k3f9a1-3]". Ids are "<session>-<n>" so a
// literal placeholder-shaped token in the query can't collide with ours.
const PLACEHOLDER_REGEX = /\[▸ vector · (\d+) dims #([a-z0-9]+-\d+)\]/g

interface StoredEmbedding {
  value: string
  byteSize: number
}

// A CSPRNG-derived prefix (not Math.random) keeps the session id unguessable so
// a placeholder-shaped token from elsewhere can't be forged to match ours.
const newSessionId = (): string => {
  const [seed] = crypto.getRandomValues(new Uint32Array(1))
  return seed.toString(36)
}

// Cap retained embeddings so a long session that repeatedly pastes and clears
// vectors can't grow the store without bound. Eviction is least-recently-used:
// placeholders still present in a model are read on every render, so only stale
// (removed/cleared) entries age out — active values stay available.
export const MAX_STORED_EMBEDDINGS = 100

let sessionId = newSessionId()
let nextPlaceholderId = 1
const collapsedValues = new Map<string, StoredEmbedding>()

// Reading an entry marks it most-recently-used (Map preserves insertion order).
const readEntry = (id: string): StoredEmbedding | undefined => {
  const entry = collapsedValues.get(id)
  if (entry) {
    collapsedValues.delete(id)
    collapsedValues.set(id, entry)
  }
  return entry
}

export interface VectorEmbeddingPlaceholder {
  id: string
  dimensions: number
  /** Undefined when the value is unknown (e.g. a query from another session). */
  byteSize?: number
  range: VectorEmbeddingRange
}

export const buildVectorEmbeddingPlaceholder = (
  id: string,
  dimensions: number,
): string => `[▸ vector · ${dimensions} dims #${id}]`

export const collapseVectorEmbeddingValue = (
  value: string,
  dimensions: number,
  byteSize: number,
): string => {
  const id = `${sessionId}-${nextPlaceholderId}`
  nextPlaceholderId += 1
  collapsedValues.set(id, { value, byteSize })
  if (collapsedValues.size > MAX_STORED_EMBEDDINGS) {
    const oldest = collapsedValues.keys().next().value
    if (oldest !== undefined) collapsedValues.delete(oldest)
  }
  return buildVectorEmbeddingPlaceholder(id, dimensions)
}

export const getVectorEmbeddingValue = (id: string): string | undefined =>
  readEntry(id)?.value

export const findVectorEmbeddingPlaceholders = (
  text: string,
): VectorEmbeddingPlaceholder[] => {
  const placeholders: VectorEmbeddingPlaceholder[] = []

  const regex = new RegExp(PLACEHOLDER_REGEX)
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    const id = match[2]
    const start = match.index

    placeholders.push({
      id,
      dimensions: Number(match[1]),
      byteSize: readEntry(id)?.byteSize,
      range: { start, end: start + match[0].length },
    })
  }

  return placeholders
}

// Unknown placeholders are left untouched so the problem stays visible.
export const expandVectorEmbeddings = (text: string): string =>
  text.replace(
    new RegExp(PLACEHOLDER_REGEX),
    (placeholder, _dimensions: string, id: string) =>
      readEntry(id)?.value ?? placeholder,
  )

export const resetVectorEmbeddingPlaceholders = (): void => {
  sessionId = 'sess'
  nextPlaceholderId = 1
  collapsedValues.clear()
}
