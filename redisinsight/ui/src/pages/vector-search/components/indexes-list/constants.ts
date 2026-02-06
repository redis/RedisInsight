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
