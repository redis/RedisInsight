import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { ZSetDetailsTable } from './zset-details-table'
import AddZsetMembers from './add-zset-members/AddZsetMembers'
import { AddItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const ZSetDetails = (props: Props) => {
  const keyType = KeyTypes.ZSet
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

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
      title="Add Members"
      width={width}
      openAddItemPanel={openAddItemPanel}
    />
  )

  return (
    <Col className="fluid relative" justify="between">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <FlexItem
        grow
        className="key-details-body"
        key="key-details-body"
        style={{ height: 300 }} // a hack to make flex-item grow to fill parent and not overflow
      >
        {!loading && (
          <FlexItem grow style={{ height: '100%' }}>
            <ZSetDetailsTable onRemoveKey={onRemoveKey} />
          </FlexItem>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddZsetMembers closePanel={closeAddItemPanel} />
          </AddKeysContainer>
        )}
      </FlexItem>
    </Col>
  )
}

export { ZSetDetails }
