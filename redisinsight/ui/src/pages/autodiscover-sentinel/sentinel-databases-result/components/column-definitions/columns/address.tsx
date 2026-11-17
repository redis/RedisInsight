import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { AddressCell } from '../components'

export const addressColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.address'),
    id: SentinelDatabaseIds.Address,
    accessorKey: SentinelDatabaseIds.Address,
    enableSorting: true,
    cell: ({
      row: {
        original: { host, port },
      },
    }) => <AddressCell host={host} port={port} />,
  }
}
