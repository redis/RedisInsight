import React, { useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArraySearchForm } from '../array-search-form'
import { ContextOption } from '../array-search-form/ArraySearchForm.types'
import { useArraySearchQuery } from '../hooks'
import { DEFAULT_CONTEXT_COUNT, DEFAULT_CONTEXT_ENABLED } from '../constants'
import * as S from '../tabs.styles'
import { NeighbourBand } from './NeighbourBand'
import { SearchTabProps } from './SearchTab.types'

const SearchTab = ({ keyProp }: SearchTabProps) => {
  const { loading: keyLoading } = useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  // Context is a display concern (±N neighbours on expand), off by default so
  // result rows aren't expandable until the user opts in.
  const [context, setContext] = useState<ContextOption>({
    enabled: DEFAULT_CONTEXT_ENABLED,
    count: DEFAULT_CONTEXT_COUNT,
  })
  const onChangeContext = (patch: Partial<ContextOption>) =>
    setContext((c) => ({ ...c, ...patch }))

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
        context={context}
        onChangeContext={onChangeContext}
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
              expandRowOnClick
              getIsRowExpandable={() => context.enabled && !!keyProp}
              renderExpandedRow={(row) =>
                keyProp ? (
                  <NeighbourBand
                    keyProp={keyProp}
                    matchIndex={row.original.index}
                    count={context.count}
                  />
                ) : null
              }
            />
          </S.TabTableWrapper>
        )}
      </S.TabBody>
    </>
  )
}

export default SearchTab
