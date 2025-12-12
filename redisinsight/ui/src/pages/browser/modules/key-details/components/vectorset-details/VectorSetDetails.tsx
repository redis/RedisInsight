import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader } from 'uiSrc/pages/browser/modules'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import {
  fetchVectorSetElements,
  fetchVectorSetInfo,
  vectorsetSelector,
} from 'uiSrc/slices/browser/vectorset'
import { AppDispatch } from 'uiSrc/slices/store'
import type { VectorSetDetailsProps } from './VectorSetDetails.types'
import { VectorSetHeader } from './components/vectorset-header'
import { VectorSetTable } from './components/vectorset-table'
import { VectorSetSearch } from './components/vectorset-search'
import { AddVectorSetElements } from './components/add-vectorset-elements'
import { AddItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'

const VectorSetDetails = (props: VectorSetDetailsProps) => {
  const keyType = KeyTypes.VectorSet
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector(vectorsetSelector)
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const keyName = selectedKeyData?.name

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)

  useEffect(() => {
    if (keyName) {
      dispatch(fetchVectorSetElements(keyName))
      dispatch(fetchVectorSetInfo(keyName))
    }
  }, [keyName])

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)

    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }

  const handleSearch = useCallback(() => {
    setIsSearchMode(true)
  }, [])

  const handleClearSearch = useCallback(() => {
    setIsSearchMode(false)
  }, [])

  const Actions = ({ width }: { width: number }) => (
    <AddItemsAction
      title="Add Elements"
      width={width}
      openAddItemPanel={openAddItemPanel}
    />
  )

  return (
    <Col className="fluid relative" justify="between">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <VectorSetHeader data-testid="vectorset-header" />
      <VectorSetSearch onSearch={handleSearch} onClear={handleClearSearch} />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <FlexItem grow className="key-details-body" key="key-details-body">
        {!loading && (
          <FlexItem grow style={{ height: '100%' }}>
            <VectorSetTable
              onRemoveKey={onRemoveKey}
              isSearchMode={isSearchMode}
            />
          </FlexItem>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddVectorSetElements closePanel={closeAddItemPanel} />
          </AddKeysContainer>
        )}
      </FlexItem>
    </Col>
  )
}

export { VectorSetDetails }
