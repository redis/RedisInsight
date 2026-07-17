import { TFunction } from 'i18next'
import { ColumnDef, PaginationState } from 'uiSrc/components/base/layout/table'
import { BrowserStorageItem } from 'uiSrc/constants'
import { TableStorageKey } from 'uiSrc/constants/storage'
import { setObjectStorageField, getObjectStorageField } from 'uiSrc/services'
import { PubSubMessage } from 'uiSrc/slices/interfaces'
import { PubSubTableColumn } from './MessagesListTable.constants'
import MessagesListTableCellTimestamp from './components/MessagesListTableCellTimestamp'
import MessagesListTableCellMessage from './components/MessagesListTableCellMessage'

export const getPubSubTableColumns = (
  t: TFunction,
): ColumnDef<PubSubMessage>[] => [
  {
    id: PubSubTableColumn.Timestamp,
    accessorKey: PubSubTableColumn.Timestamp,
    header: t('pubsub.table.column.timestamp'),
    size: 200,
    enableSorting: true,
    cell: MessagesListTableCellTimestamp,
  },
  {
    id: PubSubTableColumn.Channel,
    accessorKey: PubSubTableColumn.Channel,
    header: t('pubsub.table.column.channel'),
    size: 200,
  },
  {
    id: PubSubTableColumn.Message,
    accessorKey: PubSubTableColumn.Message,
    header: t('pubsub.table.column.message'),
    size: 800,
    cell: MessagesListTableCellMessage,
  },
]

export const handlePaginationChange = (paginationState: PaginationState) =>
  setObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.pubSubList,
    paginationState,
  )

export const getDefaultPagination = () =>
  getObjectStorageField(
    BrowserStorageItem.tablePaginationState,
    TableStorageKey.pubSubList,
  )
