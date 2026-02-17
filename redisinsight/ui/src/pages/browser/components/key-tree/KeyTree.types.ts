import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { Nullable } from 'uiSrc/utils'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { BrowserColumns, KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface KeyTreeProps {
  keysState: KeysStoreData
  loading: boolean
  deleting: boolean
  commonFilterType: Nullable<KeyTypes>
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems: (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
  ) => void
  onDelete: (key: RedisResponseBuffer) => void
  onAddKeyPanel: (value: boolean) => void
  onBulkActionsPanel: (value: boolean) => void
  visibleColumns?: BrowserColumns[]
}
