import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { SetDetailsTable } from './set-details-table'
import { AddSetMembers } from './add-set-members'
import { AddItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from 'uiSrc/pages/browser/modules/key-details/components/common/AddKeysContainer.styled'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const SetDetails = (props: Props) => {
  const keyType = KeyTypes.Set
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
    <div className="fluid flex-column relative">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <SetDetailsTable onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddSetMembers closePanel={closeAddItemPanel} />
          </AddKeysContainer>
        )}
      </div>
    </div>
  )
}

export { SetDetails }
