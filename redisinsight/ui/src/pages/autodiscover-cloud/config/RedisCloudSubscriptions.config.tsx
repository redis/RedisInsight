import React from 'react'
import { isNumber } from 'lodash'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionTypeText,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import { AlertCell } from 'uiSrc/pages/autodiscover-cloud/column-definitions/components/AlertCell/AlertCell'
import { SubscriptionCell } from 'uiSrc/pages/autodiscover-cloud/column-definitions/components/SubscriptionCell/SubscriptionCell'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const redisCloudSubscriptionsColumns: ColumnDef<RedisCloudSubscription>[] =
  [
    getSelectionColumn<RedisCloudSubscription>({
      id: AutoDiscoverCloudIds.Selection,
    }),
    {
      id: AutoDiscoverCloudIds.Alert,
      accessorKey: AutoDiscoverCloudIds.Alert,
      header: '',
      enableResizing: false,
      enableSorting: false,
      size: 50,
      cell: ({
        row: {
          original: { status, numberOfDatabases },
        },
      }) => <AlertCell status={status} numberOfDatabases={numberOfDatabases} />,
    },
    {
      id: AutoDiscoverCloudIds.Id,
      accessorKey: AutoDiscoverCloudIds.Id,
      header: AutoDiscoverCloudTitles.Id,
      enableSorting: true,
      size: 80,
      cell: ({
        row: {
          original: { id },
        },
      }) => <CellText data-testid={`id_${id}`}>{id}</CellText>,
    },
    {
      id: AutoDiscoverCloudIds.Name,
      accessorKey: AutoDiscoverCloudIds.Name,
      header: AutoDiscoverCloudTitles.Subscription,
      enableSorting: true,
      cell: ({
        row: {
          original: { name },
        },
      }) => <SubscriptionCell name={name} />,
    },
    {
      id: AutoDiscoverCloudIds.Type,
      accessorKey: AutoDiscoverCloudIds.Type,
      header: AutoDiscoverCloudTitles.Type,
      enableSorting: true,
      cell: ({
        row: {
          original: { type },
        },
      }) => <CellText>{RedisCloudSubscriptionTypeText[type] ?? '-'}</CellText>,
    },
    {
      id: AutoDiscoverCloudIds.Provider,
      accessorKey: AutoDiscoverCloudIds.Provider,
      header: AutoDiscoverCloudTitles.Provider,
      enableSorting: true,
      cell: ({
        row: {
          original: { provider },
        },
      }) => <CellText>{provider ?? '-'}</CellText>,
    },
    {
      id: AutoDiscoverCloudIds.Region,
      accessorKey: AutoDiscoverCloudIds.Region,
      header: AutoDiscoverCloudTitles.Region,
      enableSorting: true,
      cell: ({
        row: {
          original: { region },
        },
      }) => <CellText>{region ?? '-'}</CellText>,
    },
    {
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
    },
    {
      id: AutoDiscoverCloudIds.Status,
      accessorKey: AutoDiscoverCloudIds.Status,
      header: AutoDiscoverCloudTitles.Status,
      enableSorting: true,
      cell: ({
        row: {
          original: { status },
        },
      }) => (
        <CellText>{RedisCloudSubscriptionStatusText[status] ?? '-'}</CellText>
      ),
    },
  ]
