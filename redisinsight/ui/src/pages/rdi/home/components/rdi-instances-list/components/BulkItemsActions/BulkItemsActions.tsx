import React, { memo } from 'react'

import { ActionBar, DeleteAction } from 'uiSrc/components/item-list/components'
import { RdiInstance } from 'uiSrc/slices/interfaces'

import { handleDeleteInstances } from './methods/handlers'

type BulkItemsActionsProps = {
  items: RdiInstance[]
  onClose: () => void
}

const BulkItemsActions = ({ items, onClose }: BulkItemsActionsProps) => {
  if (!items.length) return null

  return (
    <ActionBar
      selectionCount={items.length}
      onCloseActionBar={onClose}
      actions={[
        <DeleteAction<RdiInstance>
          selection={items}
          onDelete={() => {
            handleDeleteInstances(items)
            onClose()
          }}
          subTitle={`Selected ${items.length} items will be deleted from RedisInsight:`}
        />,
      ]}
    />
  )
}

export default memo(BulkItemsActions)
