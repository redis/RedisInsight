import React from 'react'
import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'
import { FieldTypeCellProps } from './FieldTypeCell.types'

export const FieldTypeCell = ({ field }: FieldTypeCellProps) => (
  <FieldTag
    tag={field.type}
    dataTestId={`index-details-field-type-${field.id}`}
  />
)
