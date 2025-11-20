import React from 'react'
import { Table, type HeaderContext } from 'uiSrc/components/base/layout/table'
import { SentinelMasterListCellType } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/components/columns/types'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const SentinelMasterSelectionRow: SentinelMasterListCellType = ({
  row,
}) => (
  <Table.RowSelectionButton row={row} data-testid={`row-selection-${row.id}`} />
)

export const SentinelMasterSelectionHeader = ({
  table,
}: HeaderContext<ModifiedSentinelMaster, unknown>) => (
  <Table.HeaderMultiRowSelectionButton
    table={table}
    data-testid="row-selection"
  />
)
