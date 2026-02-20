import React from 'react'

import { KeyTypes } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { CallOut } from 'uiSrc/components/base/display'
import KeyTree from 'uiSrc/pages/browser/components/key-tree'

import TypeTabs from './TypeTabs'
import { useKeysBrowser } from '../hooks/useKeysBrowser'
import * as S from '../KeysBrowser.styles'

const noop = () => {}

const Content = () => {
  const {
    keysState,
    keysError,
    loading,
    commonFilterType,
    keyListRef,
    selectKey,
    loadMoreItems,
  } = useKeysBrowser()

  return (
    <>
      <TypeTabs />
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
            showFolderMetadata={false}
            showSelectedIndicator
          />
        )}
      </S.TreeWrapper>
    </>
  )
}

export default React.memo(Content)
