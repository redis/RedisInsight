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
  /** Test ID for the list container */
  dataTestId?: string
  /** Empty message to display when no data is available */
  emptyMessage?: string
}

/**
 * Enum representing the column identifiers for the IndexesList.
 */
export enum IndexesListColumn {
  Name = 'name',
  Prefix = 'prefix',
  FieldTypes = 'fieldTypes',
  Docs = 'docs',
  Records = 'records',
  Terms = 'terms',
  Fields = 'fields',
  Actions = 'actions',
}

/**
 * Type for cell components in the IndexesList.
 * Receives the full CellContext from the table.
 */
export type IIndexesListCell = (
  props: CellContext<IndexListRow, unknown>,
) => ReactElement<any, any> | null
