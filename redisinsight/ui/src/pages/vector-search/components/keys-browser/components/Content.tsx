import React from 'react'

import { KeyTypes } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons'
import { CallOut } from 'uiSrc/components/base/display'
import KeyTree from 'uiSrc/pages/browser/components/key-tree'

import { useKeysBrowser } from '../hooks/useKeysBrowser'
import * as S from '../KeysBrowser.styles'

const noop = () => {}

const TABS: TabInfo[] = [
  { value: KeyTypes.Hash, label: 'HASH', content: null },
  { value: KeyTypes.ReJSON, label: 'JSON', content: null },
]

const Content = () => {
  const {
    activeTab,
    keysState,
    keysError,
    loading,
    commonFilterType,
    keyListRef,
    selectKey,
    loadMoreItems,
    handleTabChange,
  } = useKeysBrowser()

  return (
    <>
      <S.TabsRow>
        <S.TabsWrapper>
          <Tabs
            tabs={TABS}
            value={activeTab}
            onChange={(value: string) => handleTabChange(value as KeyTypes)}
            data-testid="vs-keys-type-tabs"
          />
        </S.TabsWrapper>
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
      </S.TabsRow>
      <S.TreeWrapper>
        {keysError && (
          <S.ErrorWrapper>
            <CallOut variant="danger" data-testid="vs-keys-error">
              {keysError}
            </CallOut>
          </S.ErrorWrapper>
        )}
        {!keysError && (
          <KeyTree
            ref={keyListRef}
            keysState={keysState}
            loading={loading}
            deleting={false}
            commonFilterType={commonFilterType as Nullable<KeyTypes>}
            selectKey={selectKey}
            loadMoreItems={loadMoreItems}
            onDelete={noop}
            onAddKeyPanel={noop}
            onBulkActionsPanel={noop}
            visibleColumns={[]}
          />
        )}
      </S.TreeWrapper>
    </>
  )
}

export default React.memo(Content)
