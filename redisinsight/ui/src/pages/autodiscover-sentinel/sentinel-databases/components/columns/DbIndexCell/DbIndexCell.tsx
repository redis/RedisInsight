import React from 'react'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { RiIcon } from 'uiSrc/components/base/icons'

import type { DbIndexCellProps } from './DbIndexCell.types'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { getMetaProps } from 'uiSrc/utils/column'
import { HandleChangedInputProps } from '../types'

export const DbIndexCellRenderer = ({
  db = 0,
  id,
  handleChangedInput,
}: DbIndexCellProps) => (
  <div role="presentation">
    <InputFieldSentinel
      min={0}
      value={`${db}` || '0'}
      name={`db-${id}`}
      placeholder="Enter Index"
      inputType={SentinelInputFieldType.Number}
      onChangedInput={handleChangedInput}
      append={
        <RiTooltip
          anchorClassName="inputAppendIcon"
          position="left"
          content="Select the Redis logical database to work with in Browser and Workbench."
        >
          <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
        </RiTooltip>
      }
    />
  </div>
)

export const DbIndexCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { db = 0, id } = row.original
  const { handleChangedInput } = getMetaProps<HandleChangedInputProps>(column)
  return (
    <DbIndexCellRenderer
      db={db}
      id={id!}
      handleChangedInput={handleChangedInput}
    />
  )
}
