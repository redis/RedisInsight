import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArraySearchForm } from '../array-search-form'
import { useArraySearchQuery } from '../hooks'
import * as S from '../tabs.styles'
import { SearchTabProps } from './SearchTab.types'

const SearchTab = ({ keyProp, isActive }: SearchTabProps) => {
  const { loading: keyLoading } = useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  const {
    predicates,
    combinator,
    options,
    addPredicate,
    removePredicate,
    updatePredicate,
    setCombinator,
    updateOptions,
    runSearch,
    resetQuery,
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
        predicates={predicates}
        combinator={combinator}
        options={options}
        loading={loading}
        onAddPredicate={addPredicate}
        onRemovePredicate={removePredicate}
        onChangePredicate={updatePredicate}
        onChangeCombinator={setCombinator}
        onChangeOptions={updateOptions}
        onRun={runSearch}
        onReset={resetQuery}
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
              isActive={isActive}
            />
          </S.TabTableWrapper>
        )}
      </S.TabBody>
    </>
  )
}

export default SearchTab
