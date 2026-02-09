import { ReactElement } from 'react'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

/**
 * Represents a single row in the IndexesList.
 * Contains all the data needed to display an index in the list.
 */
export interface IndexListRow {
  /** Unique identifier for the index */
  id: string
  /** Name of the index */
  name: string
  /** Key prefixes that this index covers */
  prefixes: string[]
  /** Types of fields in this index */
  fieldTypes: FieldTypes[]
  /** Number of documents in the index */
  numDocs: number
  /** Number of records in the index */
  numRecords: number
  /** Number of distinct terms in the index */
  numTerms: number
  /** Number of fields/attributes in the index */
  numFields: number
}

/**
 * Props for the IndexesList component.
 */
export interface IndexesListProps {
  /** Array of index data to display in the list */
  data: IndexListRow[]
  /** Whether the list data is currently loading */
  loading?: boolean
  /** Test ID for the list container */
  dataTestId?: string
  /** Empty message to display when no data is available */
  emptyMessage?: string
  /** Callback when the Query button is clicked (index name is passed) */
  onQueryClick?: (indexName: string) => void
  /** Actions to render in the row actions menu (e.g. Edit, Delete) */
  actions?: IndexListAction[]
}

/**
 * Enum representing the column identifiers for the IndexesList.
 */
export enum IndexesListColumn {
  Name = 'name',
  Prefix = 'prefixes',
  FieldTypes = 'fieldTypes',
  Docs = 'numDocs',
  Records = 'numRecords',
  Terms = 'numTerms',
  Fields = 'numFields',
  Actions = 'actions',
}

/**
 * Action item for the index actions menu (e.g. Edit, Delete).
 */
export interface IndexListAction {
  /** Display name in the menu */
  name: string
  /** Callback invoked with the index name when the action is clicked */
  callback: (indexName: string) => void
}

/**
 * Props for the actions column cell.
 */
export interface ActionsCellProps {
  row: CellContext<IndexListRow, unknown>['row']
  onQueryClick?: (indexName: string) => void
  actions?: IndexListAction[]
}

/**
 * Type for cell components in the IndexesList.
 * Receives the full CellContext from the table.
 */
export type IIndexesListCell = (
  props: CellContext<IndexListRow, unknown>,
) => ReactElement<any, any> | null
