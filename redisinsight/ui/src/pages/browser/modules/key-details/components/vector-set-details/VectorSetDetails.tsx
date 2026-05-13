import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  clearSimilaritySearch,
  vectorSetDataSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { bufferToString } from 'uiSrc/utils'
import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { VectorSetElement } from 'uiSrc/slices/interfaces'
import { VectorSetElementForm, SubmitElement } from './vector-set-element-form'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'
import { VectorSetElementList } from './vector-set-element-list'
import { VectorSetKeySubheader } from './vector-set-key-subheader'
import { ElementDetails } from './element-details'
import {
  SimilaritySearchForm,
  SimilaritySearchPrefill,
} from './similarity-search-form'
import {
  SimilarityColumnsPopover,
  SimilaritySearchResultsTable,
  useSimilarityResultColumns,
} from './similarity-search-results'
import {
  useAddElementPanel,
  useAddElements,
  useElementDetails,
  useSimilaritySearchResults,
} from './hooks'
import * as S from './VectorSetDetails.styles'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const VectorSetDetails = (props: Props) => {
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const dispatch = useDispatch()
  const { loading } = useSelector(selectedKeySelector)
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const keyName = selectedKeyData?.name
    ? bufferToString(selectedKeyData.name)
    : ''

  const {
    viewedElement,
    isDetailsPanelOpen,
    handleViewElement,
    handleClosePanel,
    handleDrawerDidClose,
  } = useElementDetails()

  const { isAddItemPanelOpen, openAddItemPanel, closeAddItemPanel } =
    useAddElementPanel({ onOpenAddItemPanel, onCloseAddItemPanel })

  const { loading: addingLoading, vectorDim, submitElements } = useAddElements()

  const { hasResults: hasSimilarityResults, matches: similarityMatches } =
    useSimilaritySearchResults()

  const handleClearResults = useCallback(() => {
    dispatch(clearSimilaritySearch())
  }, [dispatch])

  // Drives the similarity-search form's Element-mode prefill when a user
  // clicks "Search similar" on an element row. The nonce lets the same value
  // be re-applied on repeat clicks.
  const [similarityPrefill, setSimilarityPrefill] =
    useState<SimilaritySearchPrefill>()

  const handleSearchByElement = useCallback((element: VectorSetElement) => {
    const value = bufferToString(element.name)
    setSimilarityPrefill((prev) => ({
      value,
      nonce: (prev?.nonce ?? 0) + 1,
    }))
  }, [])

  // Single source of truth shared by the results table and the Columns popover.
  const {
    columns: similarityColumns,
    columnVisibility: similarityColumnVisibility,
    columnsMap: similarityColumnsMap,
    shownColumns: similarityShownColumns,
    onShownColumnsChange: handleSimilarityColumnsChange,
    parsedAttributesCache: similarityParsedAttributesCache,
  } = useSimilarityResultColumns(similarityMatches)

  // Hide the Columns popover when there are no toggleable (attribute) columns.
  const showSimilarityColumnsPopover =
    hasSimilarityResults && similarityColumnsMap.size > 0

  const similarityAdditionalActions = showSimilarityColumnsPopover
    ? (width: number) => (
        <SimilarityColumnsPopover
          width={width}
          columnsMap={similarityColumnsMap}
          shownColumns={similarityShownColumns}
          onShownColumnsChange={handleSimilarityColumnsChange}
        />
      )
    : undefined

  const {
    total = 0,
    elements: vectorSetElements = [],
    isPaginationSupported,
  } = useSelector(vectorSetDataSelector) ?? {}

  // Similarity-search results take precedence; otherwise fall back to the
  // element-list preview, which is only shown for non-paginated vector sets.
  const showPreview = hasSimilarityResults || isPaginationSupported === false
  const previewCount = hasSimilarityResults
    ? similarityMatches.length
    : vectorSetElements.length

  const handleSubmitElements = useCallback(
    (elements: SubmitElement[]) => {
      submitElements(elements, () => closeAddItemPanel())
    },
    [submitElements, closeAddItemPanel],
  )

  return (
    <S.Container>
      <KeyDetailsHeader {...props} key="key-details-header" />
      <SimilaritySearchForm key={keyName} prefillElement={similarityPrefill} />
      <VectorSetKeySubheader
        openAddItemPanel={openAddItemPanel}
        showPreview={showPreview}
        previewCount={previewCount}
        total={total}
        hasSimilarityResults={hasSimilarityResults}
        onClearResults={handleClearResults}
        additionalActions={similarityAdditionalActions}
      />
      <S.DetailsBody>
        {!loading && (
          <S.ListWrapper>
            {hasSimilarityResults ? (
              <SimilaritySearchResultsTable
                matches={similarityMatches}
                columns={similarityColumns}
                columnVisibility={similarityColumnVisibility}
                parsedAttributesCache={similarityParsedAttributesCache}
              />
            ) : (
              <VectorSetElementList
                onRemoveKey={onRemoveKey}
                onViewElement={handleViewElement}
                onSearchByElement={handleSearchByElement}
              />
            )}
          </S.ListWrapper>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <VectorSetElementForm
              onSubmit={handleSubmitElements}
              onCancel={closeAddItemPanel}
              loading={addingLoading}
              vectorDim={vectorDim}
            />
          </AddKeysContainer>
        )}
      </S.DetailsBody>
      <ElementDetails
        element={viewedElement}
        isOpen={isDetailsPanelOpen}
        onClose={handleClosePanel}
        onDrawerDidClose={handleDrawerDidClose}
      />
    </S.Container>
  )
}

export { VectorSetDetails }
