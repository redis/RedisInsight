import React from 'react'

import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { IndexListRow } from '../../IndexesList.types'

export const FieldTypesCell = ({ row }: { row: IndexListRow }) => {
  return (
    <FlexGroup wrap gap="xs" data-testid={`index-field-types-${row.id}`}>
      {row.fieldTypes.map((type) => (
        <FieldTag
          key={`index-field-types-${row.id}--tag-${type}`}
          tag={type}
          dataTestId={`index-field-types-${row.id}--tag-${type}`}
        />
      ))}
    </FlexGroup>
  )
}
