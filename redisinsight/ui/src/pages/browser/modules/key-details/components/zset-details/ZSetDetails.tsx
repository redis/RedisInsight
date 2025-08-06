import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import { RiCol, RiFlexItem } from 'uiBase/layout'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { ZSetDetailsTable } from './zset-details-table'
import AddZsetMembers from './add-zset-members/AddZsetMembers'
import { AddItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

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
    <RiCol className="fluid relative" justify="between">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <RiFlexItem
        grow
        className="key-details-body"
        key="key-details-body"
        style={{ height: 300 }} // a hack to make flex-item grow to fill parent and not overflow
      >
        {!loading && (
          <RiFlexItem grow style={{ height: '100%' }}>
            <ZSetDetailsTable onRemoveKey={onRemoveKey} />
          </RiFlexItem>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddZsetMembers closePanel={closeAddItemPanel} />
          </div>
        )}
      </RiFlexItem>
    </RiCol>
  )
}

export { ZSetDetails }
