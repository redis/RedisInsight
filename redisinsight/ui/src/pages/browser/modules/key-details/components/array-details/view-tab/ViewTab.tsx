import React, { useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString, isEqualBuffers } from 'uiSrc/utils'
import { Row } from 'uiSrc/components/base/layout/flex'
import { AddItemsAction } from 'uiSrc/pages/browser/modules/key-details/components/key-details-actions'

import { ArrayDetailsTable } from '../array-details-table'
import { ArrayRangeForm } from '../array-range-form'
import { ArrayAddForm } from '../array-add-form'
import { AddKeysContainer } from '../../common/AddKeysContainer.styled'
import { useArrayRangeQuery, useArrayElementActions } from '../hooks'
import * as S from '../tabs.styles'
import * as LS from './ViewTab.styles'
import { ViewTabProps } from './ViewTab.types'

const ADD_ELEMENTS_TITLE = 'Add Elements'

const ViewTab = ({
  keyProp,
  isActive,
  onOpenAddItemPanel,
  onCloseAddItemPanel,
}: ViewTabProps) => {
  const { loading, isRefreshDisabled } = useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false)
  const prevKeyProp = useRef(keyProp)

  // Close the panel when the selected key changes, otherwise a confirmed write
  // from a panel left open could target the newly selected key. Compare bytes
  // (not the decoded name) — distinct binary keys can decode to the same
  // Unicode string and would otherwise leave a stale panel open.
  useEffect(() => {
    if (!isEqualBuffers(prevKeyProp.current, keyProp)) {
      setIsAddPanelOpen(false)
    }
    prevKeyProp.current = keyProp
  }, [keyProp])

  const openAddPanel = () => {
    setIsAddPanelOpen(true)
    onOpenAddItemPanel?.()
  }

  const closeAddPanel = (isCancelled?: boolean) => {
    setIsAddPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel?.()
    }
  }

  const {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    revealIndex,
    isArrayKeyReady,
    elements,
    loading: rangeLoading,
    error: rangeError,
  } = useArrayRangeQuery(keyProp)

  // Null values in the gap-preserving range are empty slots, so delete and
  // selection are disabled on them. The delete thunk refreshes all loaded views.
  const { deleteConfig, selectionConfig, bulkDeleteConfig, clearSelection } =
    useArrayElementActions(keyProp, { elements, hideEmptySlots: true })

  // Reset also drops the multi-select: resetQuery keeps the current elements
  // (resetData: false) while the default range reloads, so without this a
  // selection made in a custom range would survive reset and could be
  // bulk-deleted.
  const handleReset = () => {
    clearSelection()
    resetQuery()
  }

  return (
    <>
      <ArrayRangeForm
        keyName={keyName}
        start={start}
        end={end}
        showEmpty={showEmpty}
        loading={rangeLoading}
        onChangeStart={setStart}
        onChangeEnd={setEnd}
        onToggleShowEmpty={setShowEmpty}
        onRun={runQuery}
        onReset={handleReset}
        disabled={!isArrayKeyReady || isRefreshDisabled}
      />
      {isArrayKeyReady && (
        <LS.SubheaderContainer grow={false}>
          <AutoSizer disableHeight>
            {({ width = 0 }) => (
              <Row style={{ width }} justify="end" align="center">
                <AddItemsAction
                  title={ADD_ELEMENTS_TITLE}
                  width={width}
                  openAddItemPanel={openAddPanel}
                />
              </Row>
            )}
          </AutoSizer>
        </LS.SubheaderContainer>
      )}
      <S.TabBody>
        {!loading && (
          <S.TabTableWrapper>
            <ArrayDetailsTable
              elements={elements}
              loading={rangeLoading}
              error={rangeError}
              isActive={isActive}
              deleteConfig={deleteConfig}
              selectionConfig={selectionConfig}
              bulkDeleteConfig={bulkDeleteConfig}
            />
          </S.TabTableWrapper>
        )}
        {isAddPanelOpen && keyProp && (
          <AddKeysContainer>
            <ArrayAddForm closePanel={closeAddPanel} onReveal={revealIndex} />
          </AddKeysContainer>
        )}
      </S.TabBody>
    </>
  )
}

export default ViewTab
