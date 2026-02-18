import React from 'react'

import { KeyTypes } from 'uiSrc/constants'
import Tabs from 'uiSrc/components/base/layout/tabs'
import { RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons'

import { useKeysBrowser } from '../hooks/useKeysBrowser'
import * as S from '../KeysBrowser.styles'

const TABS = [
  { value: KeyTypes.Hash, label: 'HASH' },
  { value: KeyTypes.ReJSON, label: 'JSON' },
]

const TypeTabs = () => {
  const { activeTab, handleTabChange } = useKeysBrowser()

  return (
    <Tabs.Compose
      value={activeTab}
      onChange={(value: string) => handleTabChange(value as KeyTypes)}
      data-testid="vs-keys-type-tabs"
    >
      <Tabs.TabBar.Compose>
        {TABS.map((tab) => (
          <Tabs.TabBar.Trigger value={tab.value} key={tab.value}>
            {tab.label}
          </Tabs.TabBar.Trigger>
        ))}
        <S.InfoIconWrapper>
          <RiTooltip
            content="Only HASH and JSON key types are supported for index creation."
            position="top"
            anchorClassName="flex-row"
          >
            <RiIcon
              type="InfoIcon"
              size="m"
              style={{ cursor: 'pointer' }}
              data-testid="vs-keys-info-icon"
            />
          </RiTooltip>
        </S.InfoIconWrapper>
      </Tabs.TabBar.Compose>
    </Tabs.Compose>
  )
}

export default React.memo(TypeTabs)
