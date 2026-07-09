import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { deleteArrayRange } from 'uiSrc/slices/browser/array'
import { KeyTypes } from 'uiSrc/constants'
import { bufferToString, isEqualBuffers } from 'uiSrc/utils'
import { Row } from 'uiSrc/components/base/layout/flex'
import { AddItemsAction } from 'uiSrc/pages/browser/modules/key-details/components/key-details-actions'

import { ArrayDetailsTable } from '../array-details-table'
import { ArrayRangeForm } from '../array-range-form'
import { ArrayAddForm } from '../array-add-form'
import { DeleteRangeAction } from '../delete-range-action'
import { KeyDetailsSubheader } from '../../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from '../../common/AddKeysContainer.styled'
import { useArrayRangeQuery, useArrayElementActions } from '../hooks'
import * as S from '../tabs.styles'
import { ViewTabProps } from './ViewTab.types'

const ADD_ELEMENTS_TITLE = 'Add Elements'

const ViewTab = ({
  keyProp,
  isActive,
  onOpenAddItemPanel,
  onCloseAddItemPanel,
}: ViewTabProps) => {
  const dispatch = useAppDispatch()
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

  // Deletes the inclusive [start, end] window from the live inputs — not
  // the last-run query — so a range can be deleted without loading it
  // first. The confirm popover in the form states the exact window. Same
  // contract as the bulk delete: guard against a double dispatch, drop the
  // multi-select only on success (deleted rows must not linger armed behind
  // the header trash), keep it on failure so the user can retry.
  const deletingRangeRef = useRef(false)
  const handleDeleteRange = async () => {
    if (!keyProp || !isArrayKeyReady || deletingRangeRef.current) return
    deletingRangeRef.current = true
    try {
      const deleted = await dispatch(deleteArrayRange(keyProp, start, end))
      if (deleted) clearSelection()
    } finally {
      deletingRangeRef.current = false
    }
  }

  // KeyDetailsSubheader renders the Actions render prop as <Actions />, so a
  // fresh function each render is a new component type — React would remount the
  // subtree and drop DeleteRangeAction's open confirm popover on any parent
  // update (editing the range, a loading flip, a redux change). Keep Actions'
  // identity stable and read live values through a ref so it stays dep-free.
  const latest = {
    keyName,
    start,
    end,
    rangeLoading,
    isRefreshDisabled,
    handleDeleteRange,
    openAddPanel,
  }
  const latestRef = useRef(latest)
  latestRef.current = latest

  const Actions = useCallback(
    ({ width }: { width: number }) => (
      <Row align="center" gap="m" grow={false}>
        <DeleteRangeAction
          keyName={latestRef.current.keyName}
          start={latestRef.current.start}
          end={latestRef.current.end}
          loading={latestRef.current.rangeLoading}
          disabled={latestRef.current.isRefreshDisabled}
          onDeleteRange={latestRef.current.handleDeleteRange}
        />
        <AddItemsAction
          title={ADD_ELEMENTS_TITLE}
          width={width}
          openAddItemPanel={latestRef.current.openAddPanel}
        />
      </Row>
    ),
    [],
  )

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
        <KeyDetailsSubheader keyType={KeyTypes.Array} Actions={Actions} />
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
