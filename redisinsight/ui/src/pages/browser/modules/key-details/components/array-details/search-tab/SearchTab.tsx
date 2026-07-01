import React, { useEffect, useRef, useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString, isEqualBuffers } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArraySearchForm } from '../array-search-form'
import { ContextOption } from '../array-search-form/ArraySearchForm.types'
import { BulkDeleteBar } from '../components/BulkDeleteBar'
import { useArraySearchQuery, useArrayElementActions } from '../hooks'
import { DEFAULT_CONTEXT } from '../constants'
import * as S from '../tabs.styles'
import { NeighbourBand } from './NeighbourBand'
import { SearchTabProps } from './SearchTab.types'

const SearchTab = ({ keyProp, isActive }: SearchTabProps) => {
  const { loading: keyLoading, isRefreshDisabled } =
    useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  // Context is a display concern (±N neighbours on expand), off by default so
  // result rows aren't expandable until the user opts in.
  const [context, setContext] = useState<ContextOption>(DEFAULT_CONTEXT)
  const onChangeContext = (patch: Partial<ContextOption>) =>
    setContext((c) => ({ ...c, ...patch }))

  // Context is SearchTab-owned and the tab stays mounted across key switches,
  // so reset it on a real key change — otherwise a new key inherits the
  // previous key's toggle/count (the query hook resets only its own state).
  const lastKeyRef = useRef<RedisResponseBuffer | null>(null)
  useEffect(() => {
    if (!keyProp) return
    if (lastKeyRef.current && isEqualBuffers(lastKeyRef.current, keyProp))
      return
    lastKeyRef.current = keyProp
    setContext(DEFAULT_CONTEXT)
  }, [keyProp])

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

  // Every result is a real match — an index-only row (WITHVALUES off) has a
  // null value but is still deletable — so empty-slot hiding is off here. The
  // delete thunk refreshes all loaded views (incl. this search) afterwards.
  const {
    deleteConfig,
    selectionConfig,
    selectedCount,
    handleBulkDelete,
    clearSelection,
  } = useArrayElementActions(keyProp, { elements, hideEmptySlots: false })

  // Context lives here, not in the query hook, so the form's reset must
  // restore it too — otherwise reset leaves rows expandable at the old count.
  const handleReset = () => {
    setContext(DEFAULT_CONTEXT)
    resetQuery()
  }

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
        onReset={handleReset}
        disabled={!isArrayKeyReady || isRefreshDisabled}
      />
      <S.TabBody>
        {/* Keep the tab blank until the user runs a search, then let
            ArrayDetailsTable own the loading / error / empty states. Gate on
            the key not loading too, so a key switch can't flash the previous
            key's matches before the hook's reset effect runs. */}
        {!keyLoading && (loaded || loading) && (
          <S.TabTableWrapper>
            <BulkDeleteBar
              selectedCount={selectedCount}
              onBulkDelete={handleBulkDelete}
              onClear={clearSelection}
            />
            <ArrayDetailsTable
              elements={elements}
              loading={loading}
              error={error}
              isActive={isActive}
              deleteConfig={deleteConfig}
              selectionConfig={selectionConfig}
              expandRowOnClick
              getIsRowExpandable={() => context.enabled && !!keyProp}
              renderExpandedRow={(row) =>
                context.enabled && keyProp ? (
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
