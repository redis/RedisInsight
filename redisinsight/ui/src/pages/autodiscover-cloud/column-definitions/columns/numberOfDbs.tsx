import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { isNumber } from 'lodash'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const numberOfDbsColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.NumberOfDatabases,
    accessorKey: AutoDiscoverCloudIds.NumberOfDatabases,
    header: AutoDiscoverCloudTitles.NumberOfDatabases,
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
