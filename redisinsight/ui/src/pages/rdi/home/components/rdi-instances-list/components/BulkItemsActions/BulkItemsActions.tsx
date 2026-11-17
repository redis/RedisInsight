import React, { memo } from 'react'

import { ActionBar, DeleteAction } from 'uiSrc/components/item-list/components'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'

import { handleDeleteInstances } from './methods/handlers'

type BulkItemsActionsProps = {
  items: RdiInstance[]
  onClose: () => void
}

const BulkItemsActions = ({ items, onClose }: BulkItemsActionsProps) => {
  const { t } = useTranslation()

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
          subTitle={t('rdi.home.bulkDelete.subtitle', { count: items.length })}
        />,
      ]}
    />
  )
}

export default memo(BulkItemsActions)
