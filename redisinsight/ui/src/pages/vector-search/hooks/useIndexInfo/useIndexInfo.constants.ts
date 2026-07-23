/**
 * Boolean FT.INFO attribute flags returned by the API.
 * Keep in sync with INDEX_INFO_ATTRIBUTE_BOOLEAN_FLAGS on the backend.
 * Order controls Search IndexInfo column order when flags are present.
 */
export const INDEX_ATTRIBUTE_BOOLEAN_FLAGS = [
  'SORTABLE',
  'NOINDEX',
  'CASESENSITIVE',
  'UNF',
  'NOSTEM',
  'WITHSUFFIXTRIE',
  'INDEXEMPTY',
  'INDEXMISSING',
] as const

export type IndexAttributeBooleanFlag =
  (typeof INDEX_ATTRIBUTE_BOOLEAN_FLAGS)[number]
