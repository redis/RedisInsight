import React from 'react'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { FieldTypeCellProps } from './FieldTypeCell.types'

export const FieldTypeCell = ({ field }: FieldTypeCellProps) => (
  <FieldTag
    tag={field.type}
    dataTestId={`index-details-field-type-${field.id}`}
  />
)
