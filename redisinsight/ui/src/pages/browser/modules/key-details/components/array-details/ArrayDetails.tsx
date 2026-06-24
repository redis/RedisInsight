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
}

const ArrayDetails = (props: Props) => {
  const { keyProp } = props

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
        <ViewTab keyProp={keyProp} />
      </S.TabSlot>
      <S.TabSlot $hidden={activeTab !== ArrayDetailsTab.Search}>
        <SearchTab keyProp={keyProp} />
      </S.TabSlot>
      <S.TabSlot $hidden={activeTab !== ArrayDetailsTab.Aggregate}>
        <AggregateTab keyProp={keyProp} />
      </S.TabSlot>
    </S.Container>
  )
}

export { ArrayDetails }
