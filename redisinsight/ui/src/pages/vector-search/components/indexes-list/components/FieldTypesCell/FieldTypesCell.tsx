import React from 'react'

import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { IIndexesListCell } from '../../IndexesList.types'
import { FieldTypesWrapper } from './FIeldTypesCell.styles'

const FieldTypesCell: IIndexesListCell = ({ row }) => {
  const { id, fieldTypes } = row.original

  return (
    <FieldTypesWrapper data-testid={`index-field-types-${id}`}>
      {fieldTypes.map((type) => (
        <FieldTag
          key={`index-field-types-${id}--tag-${type}`}
          tag={type}
          dataTestId={`index-field-types-${id}--tag-${type}`}
        />
      ))}
    </FieldTypesWrapper>
  )
}

export default FieldTypesCell
