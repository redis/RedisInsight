import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { AddressCell } from '../components'

export const addressColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Address,
    id: ColumnDefinitionIds.Address,
    accessorKey: ColumnDefinitionIds.Address,
    enableSorting: true,
    cell: ({
      row: {
        original: { host, port },
      },
    }) => <AddressCell host={host} port={port} />,
  }
}
