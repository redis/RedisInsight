import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { isNumber } from 'lodash'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const numberOfDbsColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.NumberOfDatabases,
    accessorKey: AutoDiscoverCloudIds.NumberOfDatabases,
    header: i18n.t('autodiscover.cloud.column.numberOfDatabases'),
    enableSorting: true,
    cell: ({
      row: {
        original: { numberOfDatabases },
      },
    }) => (
      <CellText>
        {isNumber(numberOfDatabases) ? numberOfDatabases : '-'}
      </CellText>
    ),
  }
}
