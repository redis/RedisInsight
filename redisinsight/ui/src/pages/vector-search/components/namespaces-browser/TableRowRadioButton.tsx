import React from 'react'
import { RadioGroup } from '@redis-ui/components'
import { Row } from 'uiSrc/components/base/layout/table'

export const RowRadioButton = <T extends object>({ row }: { row: Row<T> }) => (
  <RadioGroup.Item
    value={row.id}
    label=""
    disabled={!row.getCanSelect()}
    onChange={() => row.toggleSelected()}
  />
)
