import React from 'react'
import { EditIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons/IconButton'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { FieldActionsCellProps } from './FieldActionsCell.types'

export const FieldActionsCell = ({ field, onEdit }: FieldActionsCellProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(field)
  }

  return (
    <RiTooltip content="Edit field type">
      <IconButton
        icon={EditIcon}
        aria-label="Edit field"
        onClick={handleClick}
        data-testid={`index-details-field-edit-btn-${field.id}`}
      />
    </RiTooltip>
  )
}
