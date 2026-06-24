import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArraySearchForm } from '../array-search-form'
import { useArraySearchQuery } from '../hooks'
import * as S from '../tabs.styles'
import { SearchTabProps } from './SearchTab.types'

const SearchTab = ({ keyProp }: SearchTabProps) => {
  const { loading: keyLoading } = useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  const {
    criteria,
    value,
    setCriteria,
    setValue,
    runSearch,
    isArrayKeyReady,
    elements,
    loading,
    error,
    loaded,
  } = useArraySearchQuery(keyProp)

  return (
    <>
      <ArraySearchForm
        keyName={keyName}
        criteria={criteria}
        value={value}
        loading={loading}
        onChangeCriteria={setCriteria}
        onChangeValue={setValue}
        onRun={runSearch}
        disabled={!isArrayKeyReady}
      />
      <S.TabBody>
        {/* Keep the tab blank until the user runs a search, then let
            ArrayDetailsTable own the loading / error / empty states. Gate on
            the key not loading too, so a key switch can't flash the previous
            key's matches before the hook's reset effect runs. */}
        {!keyLoading && (loaded || loading) && (
          <S.TabTableWrapper>
            <ArrayDetailsTable
              elements={elements}
              loading={loading}
              error={error}
            />
          </S.TabTableWrapper>
        )}
      </S.TabBody>
    </>
  )
}

export default SearchTab
