import React from 'react'

import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { KeyTypes } from 'uiSrc/constants'

export interface KeysBrowserProps {
  onSelectKey: (key: RedisResponseBuffer) => void
}

export interface KeysBrowserContextValue {
  loading: boolean
  headerLoading: boolean

  keysState: KeysStoreData
  keysError: string
  commonFilterType: Nullable<KeyTypes>
  scrollTopPosition: number

  activeTab: KeyTypes

  isSearched: boolean
  isFiltered: boolean

  keyListRef: React.RefObject<KeyTreeHandle | null>

  selectKey: ({ rowData }: { rowData: { name: RedisResponseBuffer } }) => void

  handleRefreshKeys: () => void
  handleEnableAutoRefresh: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  handleChangeAutoRefreshRate: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  handleTabChange: (tab: KeyTypes) => void
  loadMoreItems: (
    oldKeys: IKeyPropTypes[],
    range: { startIndex: number; stopIndex: number },
  ) => void
  handleScanMore: (config: { startIndex: number; stopIndex: number }) => void
}

export interface KeyTreeHandle {
  handleLoadMoreItems: (config: {
    startIndex: number
    stopIndex: number
  }) => void
}
