import React from 'react'

import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { Nullable } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'

import KeyList from '../../key-list'
import KeyTree from '../../key-tree'
import { useKeysBrowserPanel } from '../contexts/Context'
import * as S from '../KeysBrowserPanel.styles'

const Content = () => {
  const {
    viewType,
    keysState,
    keysError,
    loading,
    scrollTopPosition,
    effectiveColumns,
    commonFilterType,
    deleting,
    keyListRef,
    selectKey,
    loadMoreItems,
    onDeleteKey,
    handleAddKeyPanel,
    handleBulkActionsPanel,
  } = useKeysBrowserPanel()

  return (
    <>
      {keysError && (
        <S.ErrorContainer data-testid="keys-error">
          <div>{keysError}</div>
        </S.ErrorContainer>
      )}
      {viewType === KeyViewType.Browser && !keysError && (
        <KeyList
          hideFooter
          ref={keyListRef}
          keysState={keysState}
          loading={loading}
          scrollTopPosition={scrollTopPosition}
          visibleColumns={effectiveColumns}
          commonFilterType={commonFilterType as Nullable<KeyTypes>}
          loadMoreItems={loadMoreItems}
          selectKey={selectKey}
          onDelete={onDeleteKey}
          onAddKeyPanel={handleAddKeyPanel}
        />
      )}
      {viewType === KeyViewType.Tree && !keysError && (
        <KeyTree
          ref={keyListRef}
          keysState={keysState}
          loading={loading}
          commonFilterType={commonFilterType as Nullable<KeyTypes>}
          selectKey={selectKey}
          loadMoreItems={loadMoreItems}
          onDelete={onDeleteKey}
          deleting={deleting}
          onAddKeyPanel={handleAddKeyPanel}
          onBulkActionsPanel={handleBulkActionsPanel}
          visibleColumns={effectiveColumns}
        />
      )}
    </>
  )
}

export default React.memo(Content)
