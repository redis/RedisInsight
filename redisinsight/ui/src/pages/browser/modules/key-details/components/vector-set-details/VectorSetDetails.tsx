import React, { useCallback } from 'react'
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
import { VectorSetElementForm, SubmitElement } from './vector-set-element-form'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'
import { VectorSetElementList } from './vector-set-element-list'
import { VectorSetKeySubheader } from './vector-set-key-subheader'
import { ElementDetails } from './element-details'
import { SimilaritySearchForm } from './similarity-search-form'
import { SimilaritySearchResultsTable } from './similarity-search-results'
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

  const {
    total = 0,
    elements: vectorSetElements = [],
    isPaginationSupported,
  } = useSelector(vectorSetDataSelector) ?? {}

  // Similarity-search results take precedence over the element-list preview:
  // when results are visible we always show "Previewing matches/total".
  // Otherwise we keep the original element-list preview, which is only shown
  // for non-paginated vector sets.
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
      <SimilaritySearchForm key={keyName} />
      <VectorSetKeySubheader
        openAddItemPanel={openAddItemPanel}
        showPreview={showPreview}
        previewCount={previewCount}
        total={total}
        hasSimilarityResults={hasSimilarityResults}
        onClearResults={handleClearResults}
      />
      <S.DetailsBody>
        {!loading && (
          <S.ListWrapper>
            {hasSimilarityResults ? (
              <SimilaritySearchResultsTable matches={similarityMatches} />
            ) : (
              <VectorSetElementList
                onRemoveKey={onRemoveKey}
                onViewElement={handleViewElement}
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
