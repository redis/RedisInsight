import { PLACEHOLDER_REGEX } from './vectorEmbeddingPlaceholders.constants'
import {
  StoredEmbedding,
  VectorEmbeddingPlaceholder,
} from './vectorEmbeddingPlaceholders.types'
import { newSessionId } from './vectorEmbeddingPlaceholders.utils'

// Session-scoped store for collapsed embeddings: the placeholder text carries
// an id and the full value is kept here, so every exit path (submit, copy,
// save) must expand before the query is persisted.

let sessionId = newSessionId()
let nextPlaceholderId = 1
const collapsedValues = new Map<string, StoredEmbedding>()

export const buildVectorEmbeddingPlaceholder = (
  id: string,
  dimensions: number,
): string => `[▸vector·${dimensions}dims#${id}]`

export const collapseVectorEmbeddingValue = (
  value: string,
  dimensions: number,
  byteSize: number,
): string => {
  const id = `${sessionId}-${nextPlaceholderId}`
  nextPlaceholderId += 1
  collapsedValues.set(id, { value, byteSize })
  return buildVectorEmbeddingPlaceholder(id, dimensions)
}

export const getVectorEmbeddingValue = (id: string): string | undefined =>
  collapsedValues.get(id)?.value

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
      byteSize: collapsedValues.get(id)?.byteSize,
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
      collapsedValues.get(id)?.value ?? placeholder,
  )

export const resetVectorEmbeddingPlaceholders = (): void => {
  sessionId = newSessionId()
  nextPlaceholderId = 1
  collapsedValues.clear()
}
