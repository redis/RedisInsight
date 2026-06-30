import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArrayRangeForm } from '../array-range-form'
import { useArrayRangeQuery, useArrayElementActions } from '../hooks'
import * as S from '../tabs.styles'
import { ViewTabProps } from './ViewTab.types'

const ViewTab = ({ keyProp }: ViewTabProps) => {
  const { loading } = useAppSelector(selectedKeySelector)
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

  // Re-run the active range/scan query after a delete so the deleted slot
  // updates (empty gap or dropped row, depending on the view mode). Null
  // values here are empty slots, so the delete affordance is hidden on them.
  const { deleteConfig } = useArrayElementActions(keyProp, {
    onDeleted: runQuery,
    hideEmptySlots: true,
  })

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
        onReset={resetQuery}
        disabled={!isArrayKeyReady}
      />
      <S.TabBody>
        {!loading && (
          <S.TabTableWrapper>
            <ArrayDetailsTable
              elements={elements}
              loading={rangeLoading}
              error={rangeError}
              deleteConfig={deleteConfig}
            />
          </S.TabTableWrapper>
        )}
      </S.TabBody>
    </>
  )
}

export default ViewTab
