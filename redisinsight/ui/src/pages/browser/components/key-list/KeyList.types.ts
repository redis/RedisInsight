import { BrowserColumns, KeyTypes, SortOrder } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { ISortedColumn } from 'uiSrc/components/virtual-table/interfaces'

export interface Props {
  keysState: KeysStoreData
  loading: boolean
  scrollTopPosition?: number
  hideFooter?: boolean
  visibleColumns?: BrowserColumns[]
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems?: (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
  ) => void
  onDelete: (key: RedisResponseBuffer) => void
  commonFilterType: Nullable<KeyTypes>
  onAddKeyPanel: (value: boolean) => void
  sortedColumn?: ISortedColumn | null
  onChangeSorting?: (column: string | null, order: SortOrder | null) => void
}
