import React from 'react'

import {
  KeyViewType,
  KeysStoreData,
  SearchMode,
} from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { BrowserColumns, KeyTypes } from 'uiSrc/constants'

export interface KeysBrowserPanelContextValue {
  viewType: KeyViewType
  searchMode: SearchMode
  isTreeViewDisabled: boolean

  loading: boolean
  headerLoading: boolean

  keysState: KeysStoreData
  keysError: string
  commonFilterType: Nullable<KeyTypes>
  scrollTopPosition: number

  isSearched: boolean
  isFiltered: boolean

  shownColumns: BrowserColumns[]
  effectiveColumns: BrowserColumns[]

  selectedIndex: Nullable<RedisResponseBuffer>
  connectedInstanceId: string
  deleting: boolean

  keyListRef: React.RefObject<any>
  containerRef: React.RefObject<HTMLDivElement>

  selectKey: ({ rowData }: { rowData: any }) => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void

  handleRefreshKeys: () => void
  handleEnableAutoRefresh: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  handleChangeAutoRefreshRate: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  handleToggleColumn: (checked: boolean, columnType: BrowserColumns) => void
  openAddKeyPanel: () => void
  handleSwitchView: (type: KeyViewType) => void
  loadMoreItems: (
    oldKeys: IKeyPropTypes[],
    range: { startIndex: number; stopIndex: number },
  ) => void
  onDeleteKey: (key: RedisResponseBuffer) => void
  handleScanMore: (config: any) => void
}
