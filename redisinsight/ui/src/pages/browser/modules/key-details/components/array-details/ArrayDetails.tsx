import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'
import { ArrayDetailsTable } from './array-details-table'
import AddArrayElements from './add-array-elements/AddArrayElements'
import RemoveArrayElements from './remove-array-elements/RemoveArrayElements'
import { AddItemsAction, RemoveItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'
import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const ArrayDetails = (props: Props) => {
  const keyType = KeyTypes.Array
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props
  const { loading } = useSelector(selectedKeySelector)
  const { arrayLogicalLength, arrayNextIndex } =
    useSelector(selectedKeyDataSelector) ?? {}

  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] =
    useState<boolean>(false)
  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  const Actions = ({ width }: { width: number }) => (
    <>
      <AddItemsAction
        title="Add Elements"
        width={width}
        openAddItemPanel={openAddItemPanel}
      />
      <div className={styles.removeBtnContainer}>
        <RemoveItemsAction
          title="Remove Elements"
          openRemoveItemPanel={openRemoveItemPanel}
        />
      </div>
    </>
  )

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <div style={{ padding: '0 16px' }}>
              <Text size="s" color="subdued">
                Populated elements are shown below. Logical length:{' '}
                {arrayLogicalLength ?? '0'}
                {arrayNextIndex ? `, next insert index: ${arrayNextIndex}` : ''}
              </Text>
            </div>
            <Spacer size="s" />
            <ArrayDetailsTable />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddArrayElements closePanel={closeAddItemPanel} />
          </AddKeysContainer>
        )}
        {isRemoveItemPanelOpen && (
          <AddKeysContainer>
            <RemoveArrayElements
              closePanel={closeRemoveItemPanel}
              onRemoveKey={onRemoveKey}
            />
          </AddKeysContainer>
        )}
      </div>
    </div>
  )
}

export { ArrayDetails }
