import React from 'react'
import { EditIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons/IconButton'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { useTranslation } from 'uiSrc/i18n'
import { FieldActionsCellProps } from './FieldActionsCell.types'

export const FieldActionsCell = ({ field, onEdit }: FieldActionsCellProps) => {
  const { t } = useTranslation()
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(field)
  }

  return (
    <RiTooltip content={t('vectorSearch.indexDetails.editFieldType')}>
      <IconButton
        icon={EditIcon}
        aria-label={t('vectorSearch.indexDetails.editFieldAria')}
        onClick={handleClick}
        data-testid={`index-details-field-edit-btn-${field.id}`}
      />
    </RiTooltip>
  )
}
