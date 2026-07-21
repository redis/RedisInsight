import { VectorEmbeddingRange } from './vectorEmbeddingUtils.types'

/**
 * In-memory store behind collapsed vector embeddings. Collapsing replaces the
 * embedding text in the editor with a short placeholder that carries an id;
 * the full value is kept here and re-inserted whenever the query leaves the
 * editor (submit, copy, save) or the user expands the placeholder again.
 *
 * The store is session-scoped: a placeholder persisted outside the running
 * app (e.g. in a saved query) cannot be expanded after a restart, which is
 * why every exit path must expand before persisting.
 */

// Matches e.g. "[▸ vector · 1536 dims #3]". The leading bracket and the
// trailing id are hidden visually by the collapse hook.
const PLACEHOLDER_REGEX = /\[▸ vector · (\d+) dims #(\d+)\]/g

const PLACEHOLDER_PREFIX_LENGTH = '['.length

let nextPlaceholderId = 1
const collapsedValues = new Map<number, string>()

export interface VectorEmbeddingPlaceholder {
  id: number
  dimensions: number
  /** Character range of the whole placeholder within the scanned text. */
  range: VectorEmbeddingRange
  /** Range of the visible "▸ vector · N dims" part (brackets/id are hidden). */
  visibleRange: VectorEmbeddingRange
  /** False when the value is unknown (e.g. text pasted from another session). */
  hasValue: boolean
}

export const buildVectorEmbeddingPlaceholder = (
  id: number,
  dimensions: number,
): string => `[▸ vector · ${dimensions} dims #${id}]`

/** Stores the full embedding text and returns the placeholder replacing it. */
export const collapseVectorEmbeddingValue = (
  value: string,
  dimensions: number,
): string => {
  const id = nextPlaceholderId
  nextPlaceholderId += 1
  collapsedValues.set(id, value)
  return buildVectorEmbeddingPlaceholder(id, dimensions)
}

export const getVectorEmbeddingValue = (id: number): string | undefined =>
  collapsedValues.get(id)

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
    const end = start + match[0].length
    const idSuffixLength = ` #${match[2]}]`.length

    placeholders.push({
      id,
      dimensions: Number(match[1]),
      range: { start, end },
      visibleRange: {
        start: start + PLACEHOLDER_PREFIX_LENGTH,
        end: end - idSuffixLength,
      },
      hasValue: collapsedValues.has(id),
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
      collapsedValues.get(Number(id)) ?? placeholder,
  )

/** Test helper: clears stored values and restarts id numbering. */
export const resetVectorEmbeddingPlaceholders = (): void => {
  nextPlaceholderId = 1
  collapsedValues.clear()
}
