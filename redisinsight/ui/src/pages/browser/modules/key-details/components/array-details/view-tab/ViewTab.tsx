import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArrayRangeForm } from '../array-range-form'
import { useArrayRangeQuery, useArrayElementActions } from '../hooks'
import * as S from '../tabs.styles'
import { ViewTabProps } from './ViewTab.types'

const ViewTab = ({ keyProp, isActive }: ViewTabProps) => {
  const { loading, isRefreshDisabled } = useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  const {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
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
      </S.TabBody>
    </>
  )
}

export default ViewTab
