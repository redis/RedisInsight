import { ReactNode } from 'react'
import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { Row } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { Nullable } from 'uiSrc/utils'

import { ArrayElementDeleteConfig } from './components/RowActionsCell'
import { ArrayBulkDeleteConfig } from './components/BulkDeleteHeaderCell'

/**
 * Opt-in multi-select wiring forwarded to the redis-ui table's
 * `RowSelectionPlugin`. `getRowCanSelect` disables the checkbox on rows that
 * aren't deletable (e.g. empty View gaps); selection keys are element indexes.
 */
export interface ArrayElementSelectionConfig {
  rowSelection: Record<string, boolean>
  onRowSelectionChange: (state: Record<string, boolean>) => void
  getRowCanSelect: (element: ArrayDataElement) => boolean
}

export interface ArrayDetailsTableProps {
  elements: ArrayDataElement[]
  loading: boolean
  /** Surfaces a failed ARGETRANGE/ARSCAN in the empty state so the table
   *  doesn't misleadingly read "No elements in range" when the request
   *  errored. The slice still also raises a toast via `addErrorNotification`. */
  error?: string
  /** True when this table is in the visible tab. Both View and Search mount
   *  a table at once, so only the active one drives the shared key-header
   *  refresh flag; an inactive table also abandons any open editor. */
  isActive: boolean
  /** Search context band only. Renders an expanded panel under each row;
   *  omitted on the View / Aggregate tabs, which then show no expand
   *  affordance. */
  renderExpandedRow?: (row: Row<ArrayDataElement>) => ReactNode
  getIsRowExpandable?: (rowData: ArrayDataElement) => boolean
  expandRowOnClick?: boolean
  /** Enables the per-row delete affordance when provided. Omitted (e.g. the
   *  Aggregate tab) ⇒ no actions column. */
  deleteConfig?: ArrayElementDeleteConfig
  /** Enables multi-select checkboxes when provided. */
  selectionConfig?: ArrayElementSelectionConfig
  /** Enables the bulk-delete trigger in the actions-column header. */
  bulkDeleteConfig?: ArrayBulkDeleteConfig
}

/**
 * Shared cell config passed to the redis-ui table via `meta`. Lets the
 * static column definitions read `compressor`/`viewFormat` at render time
 * without each cell having to close over them via the parent component.
 */
export interface ArrayTableConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  /** Index of the row currently in edit mode, or null when none is. */
  editingIndex: Nullable<string>
  /** Open / close inline edit for a row's value. */
  onEditElement: (index: string, isEditing: boolean) => void
  /** Persist an edited value (plain string from the editor) via ARSET. */
  onApplyEditElement: (index: string, value: string) => void
  /** Open the Monaco drawer editor for a row's value. */
  onOpenValueEditor: (index: string) => void
  /** True while an ARSET write is in flight — keeps the editor in its loading
   *  state and blocks a second edit from overlapping the request. */
  updating: boolean
  /** True while a read that writes a patched view (range/scan or search) is in
   *  flight — blocks opening an edit so a late response can't overwrite the
   *  optimistic patch. */
  loading: boolean
  /** Present only when the consumer enables row deletion; the actions cell
   *  reads it from the table `meta`. */
  deleteConfig?: ArrayElementDeleteConfig
  /** Present only when multi-select is enabled; the actions-column header
   *  reads it from the table `meta` to render the bulk-delete trigger. */
  bulkDeleteConfig?: ArrayBulkDeleteConfig
}
