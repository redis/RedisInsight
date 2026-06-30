import { ReactNode } from 'react'
import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Row } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { Nullable } from 'uiSrc/utils'

import { ArrayElementDeleteConfig } from './components/RowActionsCell'

export interface ArrayDetailsTableProps {
  elements: ArrayDataElement[]
  loading: boolean
  /** Surfaces a failed ARGETRANGE/ARSCAN in the empty state so the table
   *  doesn't misleadingly read "No elements in range" when the request
   *  errored. The slice still also raises a toast via `addErrorNotification`. */
  error?: string
  /** Search context band only. Renders an expanded panel under each row;
   *  omitted on the View / Aggregate tabs, which then show no expand
   *  affordance. */
  renderExpandedRow?: (row: Row<ArrayDataElement>) => ReactNode
  getIsRowExpandable?: (rowData: ArrayDataElement) => boolean
  expandRowOnClick?: boolean
  /** Enables the per-row delete affordance when provided. Omitted (e.g. the
   *  Aggregate tab) ⇒ no actions column. */
  deleteConfig?: ArrayElementDeleteConfig
}

/**
 * Shared cell config passed to the redis-ui table via `meta`. Lets the
 * static column definitions read `compressor`/`viewFormat` at render time
 * without each cell having to close over them via the parent component.
 */
export interface ArrayTableConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  /** Present only when the consumer enables row deletion; the actions cell
   *  reads it from the table `meta`. */
  deleteConfig?: ArrayElementDeleteConfig
}
