import React, { useState } from 'react'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import AggregateTab from './aggregate-tab'
import ArrayTabs from './array-tabs'
import SearchTab from './search-tab'
import ViewTab from './view-tab'
import { ArrayDetailsTab, DEFAULT_ARRAY_DETAILS_TAB } from './constants'
import * as S from './ArrayDetails.styles'

export interface Props extends KeyDetailsHeaderProps {
  keyProp: RedisResponseBuffer | null
  onOpenAddItemPanel?: () => void
  onCloseAddItemPanel?: () => void
}

const ArrayDetails = (props: Props) => {
  const { keyProp, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const [activeTab, setActiveTab] = useState<ArrayDetailsTab>(
    DEFAULT_ARRAY_DETAILS_TAB,
  )

  return (
    <S.Container data-testid="array-details">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <S.TabsWrapper>
        <ArrayTabs value={activeTab} onChange={setActiveTab} />
      </S.TabsWrapper>
      <S.TabSlot $hidden={activeTab !== ArrayDetailsTab.View}>
        <ViewTab
          keyProp={keyProp}
          isActive={activeTab === ArrayDetailsTab.View}
          onOpenAddItemPanel={onOpenAddItemPanel}
          onCloseAddItemPanel={onCloseAddItemPanel}
        />
      </S.TabSlot>
      <S.TabSlot $hidden={activeTab !== ArrayDetailsTab.Search}>
        <SearchTab
          keyProp={keyProp}
          isActive={activeTab === ArrayDetailsTab.Search}
        />
      </S.TabSlot>
      <S.TabSlot $hidden={activeTab !== ArrayDetailsTab.Aggregate}>
        <AggregateTab keyProp={keyProp} />
      </S.TabSlot>
    </S.Container>
  )
}

export { ArrayDetails }
