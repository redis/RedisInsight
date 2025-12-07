import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import { ColumnDef, PaginationState } from 'uiSrc/components/base/layout/table'
import { BrowserStorageItem } from 'uiSrc/constants'
import { TableStorageKey } from 'uiSrc/constants/storage'
import { setObjectStorageField, getObjectStorageField } from 'uiSrc/services'
import {
  PUB_SUB_TABLE_COLUMN_FIELD_NAME_MAP,
  PubSubTableColumn,
} from './MessagesListTable.constants'
import MessagesListTableCellTimestamp from './components/MessagesListTableCellTimestamp'

export const PUB_SUB_TABLE_COLUMNS: ColumnDef<IMessage>[] = [
  {
    id: PubSubTableColumn.Timestamp,
    accessorKey: PubSubTableColumn.Timestamp,
    header: PUB_SUB_TABLE_COLUMN_FIELD_NAME_MAP.get(
      PubSubTableColumn.Timestamp,
    ),
    size: 30,
    enableSorting: true,
    cell: MessagesListTableCellTimestamp,
  },
  {
    id: PubSubTableColumn.Channel,
    accessorKey: PubSubTableColumn.Channel,
    header: PUB_SUB_TABLE_COLUMN_FIELD_NAME_MAP.get(PubSubTableColumn.Channel),
    size: 40,
  },
  {
    id: PubSubTableColumn.Message,
    accessorKey: PubSubTableColumn.Message,
    header: PUB_SUB_TABLE_COLUMN_FIELD_NAME_MAP.get(PubSubTableColumn.Message),
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
