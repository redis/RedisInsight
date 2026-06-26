import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArrayRangeForm } from '../array-range-form'
import { useArrayRangeQuery } from '../hooks'
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
            />
          </S.TabTableWrapper>
        )}
      </S.TabBody>
    </>
  )
}

export default ViewTab
