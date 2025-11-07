import React, { memo } from 'react'

import {
  ActionBar,
  ExportAction,
  DeleteAction,
} from 'uiSrc/components/item-list/components'

import {
  handleDeleteInstances,
  handleExportInstances,
} from './methods/handlers'
import { Instance } from 'uiSrc/slices/interfaces'

const actionMessage = (action: string, length: number) =>
  `Selected ${length} items will be ${action} from RedisInsight:`

type BulkItemsActionsProps = {
  items: Instance[]
  onClose: () => void
}

const BulkItemsActions = ({ items, onClose }: BulkItemsActionsProps) => {
  if (!items.length) {
    return null
  }

  return (
    <ActionBar
      selectionCount={items.length}
      onCloseActionBar={onClose}
      actions={[
        <ExportAction<Instance>
          selection={items}
          onExport={(_, withSecrets) => {
            handleExportInstances(items, withSecrets)
            onClose()
          }}
          subTitle={actionMessage('exported', items.length)}
        />,
        <DeleteAction<Instance>
          selection={items}
          onDelete={() => {
            handleDeleteInstances(items)
            onClose()
          }}
          subTitle={actionMessage('deleted', items.length)}
        />,
      ]}
    />
  )
}

export default memo(BulkItemsActions)
