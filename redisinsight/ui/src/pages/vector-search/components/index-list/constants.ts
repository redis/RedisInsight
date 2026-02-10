import { IndexListColumn } from './IndexList.types'

/**
 * Column header labels for the IndexList component.
 */
export const INDEX_LIST_COLUMN_HEADERS: Record<IndexListColumn, string> = {
  [IndexListColumn.Name]: 'Index name',
  [IndexListColumn.Prefix]: 'Index prefix',
  [IndexListColumn.FieldTypes]: 'Index fields',
  [IndexListColumn.Docs]: 'Docs',
  [IndexListColumn.Records]: 'Records',
  [IndexListColumn.Terms]: 'Terms',
  [IndexListColumn.Fields]: 'Fields',
  [IndexListColumn.Actions]: '',
}

/**
 * Column header tooltips for the IndexList component.
 */
export const INDEX_LIST_COLUMN_TOOLTIPS: Partial<
  Record<IndexListColumn, string>
> = {
  [IndexListColumn.Prefix]:
    'Keys matching this prefix are automatically indexed.',
  [IndexListColumn.Docs]: 'Number of documents currently indexed.',
  [IndexListColumn.Records]:
    'Total indexed field-value pairs across all documents. One document with 5 fields = 5 records.',
  [IndexListColumn.Terms]:
    'Unique words extracted from TEXT fields for full-text search.',
  [IndexListColumn.Fields]:
    'Total number of fields defined in the index schema.',
}
