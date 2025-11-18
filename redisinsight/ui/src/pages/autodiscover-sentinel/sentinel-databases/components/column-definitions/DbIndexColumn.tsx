import React from 'react'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { RiIcon } from 'uiSrc/components/base/icons'
import { ColumnDefinitionTitles } from './constants'

export const DbIndexColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.DatabaseIndex,
    id: 'db',
    accessorKey: 'db',
    size: 140,
    cell: ({
      row: {
        original: { db = 0, id },
      },
    }) => (
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
    ),
  }
}
