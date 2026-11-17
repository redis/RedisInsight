import React, { memo } from 'react'

import {
  ActionBar,
  ExportAction,
  DeleteAction,
} from 'uiSrc/components/item-list/components'
import { useTranslation } from 'uiSrc/i18n'

import {
  handleDeleteInstances,
  handleExportInstances,
} from './methods/handlers'
import { Instance } from 'uiSrc/slices/interfaces'

type BulkItemsActionsProps = {
  items: Instance[]
  onClose: () => void
}

const BulkItemsActions = ({ items, onClose }: BulkItemsActionsProps) => {
  const { t } = useTranslation()

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
          subTitle={t('home.databaseList.bulkActions.export.subtitle', {
            count: items.length,
          })}
        />,
        <DeleteAction<Instance>
          selection={items}
          onDelete={() => {
            handleDeleteInstances(items)
            onClose()
          }}
          subTitle={t('home.databaseList.bulkActions.delete.subtitle', {
            count: items.length,
          })}
        />,
      ]}
    />
  )
}

export default memo(BulkItemsActions)
