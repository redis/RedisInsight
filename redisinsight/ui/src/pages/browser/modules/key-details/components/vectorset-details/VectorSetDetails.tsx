import React, { useState, useEffect } from 'react'
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
import { AddItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

const VectorSetDetails = (props: VectorSetDetailsProps) => {
  const keyType = KeyTypes.VectorSet
  const { onOpenAddItemPanel, onCloseAddItemPanel } = props

  const dispatch = useDispatch<AppDispatch>()
  const { loading, data } = useSelector(vectorsetSelector)
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const keyName = selectedKeyData?.name

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

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
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <FlexItem
        grow
        className="key-details-body"
        key="key-details-body"
        style={{ height: 300 }}
      >
        {!loading && (
          <FlexItem grow style={{ height: '100%' }}>
            {/* TODO: VectorSetDetailsTable will be added in a later task */}
            <div style={{ padding: '16px' }}>
              Vector Set: {data.total} elements
            </div>
          </FlexItem>
        )}
        {isAddItemPanelOpen && (
          <div>
            {/* TODO: AddVectorSetElement will be added in a later task */}
            <button type="button" onClick={() => closeAddItemPanel(true)}>
              Close
            </button>
          </div>
        )}
      </FlexItem>
    </Col>
  )
}

export { VectorSetDetails }
