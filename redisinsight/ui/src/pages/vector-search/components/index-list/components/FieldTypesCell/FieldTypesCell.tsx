import React, { useMemo } from 'react'

import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { IndexListRow } from '../../IndexList.types'

export const FieldTypesCell = ({ row }: { row: IndexListRow }) => {
  const fieldTags = useMemo(
    () =>
      row.fieldTypes.map((type) => (
        <FieldTag
          key={`index-field-types-${row.id}--tag-${type}`}
          tag={type}
          dataTestId={`index-field-types-${row.id}--tag-${type}`}
        />
      )),
    [row.fieldTypes, row.id],
  )

  return (
    <FlexGroup wrap gap="s" data-testid={`index-field-types-${row.id}`}>
      {fieldTags}
    </FlexGroup>
  )
}
