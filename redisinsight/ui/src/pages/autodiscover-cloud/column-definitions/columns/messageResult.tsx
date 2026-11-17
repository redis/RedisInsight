import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { MessageResultCell } from '../components/MessageResultCell/MessageResultCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const messageResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.result'),
    id: AutoDiscoverCloudIds.MessageAdded,
    accessorKey: AutoDiscoverCloudIds.MessageAdded,
    enableSorting: true,
    minSize: 110,
    cell: ({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) => (
      <MessageResultCell
        statusAdded={statusAdded}
        messageAdded={messageAdded}
      />
    ),
  }
}
