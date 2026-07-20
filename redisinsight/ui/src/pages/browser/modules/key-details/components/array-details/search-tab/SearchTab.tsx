import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString, isEqualBuffers } from 'uiSrc/utils'

import { ArrayDetailsTable } from '../array-details-table'
import { ArraySearchForm } from '../array-search-form'
import { ContextControl, ContextOption } from './ContextControl'
import { KeyDetailsSubheader } from '../../key-details-subheader/KeyDetailsSubheader'
import { useArraySearchQuery, useArrayElementActions } from '../hooks'
import { DEFAULT_CONTEXT } from '../constants'
import * as S from '../tabs.styles'
import { NeighbourBand } from './NeighbourBand'
import { SearchTabProps } from './SearchTab.types'

const SearchTab = ({ keyProp, isActive }: SearchTabProps) => {
  const { loading: keyLoading, isRefreshDisabled } =
    useAppSelector(selectedKeySelector)
  const keyName = keyProp ? bufferToString(keyProp) : ''

  // Display-only ±N neighbours shown when a row expands; off by default.
  const [context, setContext] = useState<ContextOption>(DEFAULT_CONTEXT)
  const onChangeContext = (patch: Partial<ContextOption>) =>
    setContext((c) => ({ ...c, ...patch }))

  // The tab stays mounted across key switches, so reset Context on a new key.
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

  // Every result is a real match (index-only rows still delete), so keep empty slots.
  const { deleteConfig, selectionConfig, bulkDeleteConfig, clearSelection } =
    useArrayElementActions(keyProp, { elements, hideEmptySlots: false })

  // Reset the state the query hook doesn't own: Context and the selection.
  const handleReset = () => {
    setContext(DEFAULT_CONTEXT)
    clearSelection()
    resetQuery()
  }

  // Show Context and the table only after a search; the !keyLoading guard
  // avoids flashing the previous key's matches during a switch.
  const showResults = !keyLoading && (loaded || loading)

  // Stable identity via ref so the subheader doesn't remount the control and
  // steal focus from the count input while typing.
  const contextActionsRef = useRef({
    context,
    onChangeContext,
    isRefreshDisabled,
  })
  contextActionsRef.current = { context, onChangeContext, isRefreshDisabled }

  const ContextStartActions = useCallback(
    () => (
      <ContextControl
        context={contextActionsRef.current.context}
        onChange={contextActionsRef.current.onChangeContext}
        disabled={contextActionsRef.current.isRefreshDisabled}
      />
    ),
    [],
  )

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
        onReset={handleReset}
        disabled={!isArrayKeyReady || isRefreshDisabled}
      />
      {isArrayKeyReady && (
        <KeyDetailsSubheader
          keyType={KeyTypes.Array}
          StartActions={showResults ? ContextStartActions : undefined}
        />
      )}
      <S.TabBody>
        {showResults && (
          <S.TabTableWrapper>
            <ArrayDetailsTable
              elements={elements}
              loading={loading}
              error={error}
              isActive={isActive}
              deleteConfig={deleteConfig}
              selectionConfig={selectionConfig}
              bulkDeleteConfig={bulkDeleteConfig}
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
