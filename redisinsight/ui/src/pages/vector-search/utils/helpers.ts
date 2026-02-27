import {
  CreateIndexLocationState,
  CreateIndexMode,
  ExistingDataLocationState,
  SampleDataLocationState,
} from '../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

/** Narrows location state to ExistingData mode (user-provided key). */
export const isExistingDataState = (
  state: CreateIndexLocationState | undefined,
): state is ExistingDataLocationState =>
  state?.mode === CreateIndexMode.ExistingData

/** Narrows location state to SampleData mode (pre-built dataset). */
export const isSampleDataState = (
  state: CreateIndexLocationState | undefined,
): state is SampleDataLocationState =>
  state != null && !isExistingDataState(state)

/** Returns true when the ExistingData state already carries a pre-selected key. */
export const hasPreselectedKey = (
  state: CreateIndexLocationState | undefined,
): boolean => isExistingDataState(state) && !!state.initialKey

/**
 * Formats prefixes array for display.
 * Joins prefixes with comma and wraps each in quotes.
 */
export const formatPrefixes = (prefixes: string[] | undefined): string => {
  if (!prefixes || prefixes.length === 0) {
    return ''
  }

  return prefixes.map((prefix) => `"${prefix}"`).join(', ')
}

/**
 * Extracts the namespace prefix from a key name.
 * e.g. "bikes:10002" → "bikes:", "schools:bmx:large" → "schools:bmx:"
 * If no separator is found, returns an empty string.
 */
export const extractNamespace = (keyName: string): string => {
  const lastColonIdx = keyName.lastIndexOf(':')

  if (lastColonIdx === -1) {
    return ''
  }

  return keyName.slice(0, lastColonIdx + 1)
}

/**
 * Derives a default index name from a namespace prefix.
 * e.g. "bikes:" → "idx:bikes", "" → "idx:myindex"
 */
export const deriveIndexName = (namespace: string): string => {
  const stripped = namespace.replace(/:$/, '')
  return stripped ? `idx:${stripped}` : 'idx:myindex'
}

/**
 * Display label used in place of an empty index name.
 * Also doubles as the RiSelect value and URL segment, since both
 * RiSelect and React Router cannot handle empty strings.
 */
export const EMPTY_INDEX_NAME_LABEL = '(empty name)'

export const getIndexDisplayName = (name: string): string =>
  name === '' ? EMPTY_INDEX_NAME_LABEL : name

export const resolveIndexName = (displayName: string): string =>
  displayName === EMPTY_INDEX_NAME_LABEL ? '' : displayName

export const encodeIndexNameForUrl = (name: string): string =>
  encodeURIComponent(getIndexDisplayName(name))

export const decodeIndexNameFromUrl = (urlSegment: string): string =>
  resolveIndexName(decodeURIComponent(urlSegment))
