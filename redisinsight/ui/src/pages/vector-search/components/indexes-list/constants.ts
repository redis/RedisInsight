import { IndexesListColumn } from './IndexesList.types'

/**
 * Column header labels for the IndexesList component.
 */
export const INDEXES_LIST_COLUMN_HEADERS: Record<IndexesListColumn, string> = {
  [IndexesListColumn.Name]: 'Index name',
  [IndexesListColumn.Prefix]: 'Index prefix',
  [IndexesListColumn.FieldTypes]: 'Index fields',
  [IndexesListColumn.Docs]: 'Docs',
  [IndexesListColumn.Records]: 'Records',
  [IndexesListColumn.Terms]: 'Terms',
  [IndexesListColumn.Fields]: 'Fields',
  [IndexesListColumn.Actions]: '',
}

/**
 * Column header tooltips for the IndexesList component.
 */
export const INDEXES_LIST_COLUMN_TOOLTIPS: Partial<
  Record<IndexesListColumn, string>
> = {
  [IndexesListColumn.Prefix]:
    'Keys matching this prefix are automatically indexed.',
  [IndexesListColumn.Docs]: 'Number of documents currently indexed.',
  [IndexesListColumn.Records]:
    'Total indexed field-value pairs across all documents. One document with 5 fields = 5 records.',
  [IndexesListColumn.Terms]:
    'Unique words extracted from TEXT fields for full-text search.',
  [IndexesListColumn.Fields]:
    'Total number of fields defined in the index schema.',
}
