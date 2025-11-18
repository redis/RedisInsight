import React from 'react'
import styled from 'styled-components'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { RiIcon } from 'uiSrc/components/base/icons'
import { ColumnDefinitionTitles } from './constants'
import { Row } from 'uiSrc/components/base/layout/flex'

const InputContainer = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  max-width: 100px;
`

export const DbIndexColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    isHeaderCustom: true,
    header: () => {
      return (
        <Row gap="m" align="start">
          {ColumnDefinitionTitles.DatabaseIndex}
          <RiTooltip
            anchorClassName="inputAppendIcon"
            position="left"
            content="Select the Redis logical database to work with in Browser and Workbench."
          >
            <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
          </RiTooltip>
        </Row>
      )
    },
    id: 'db',
    accessorKey: 'db',
    maxSize: 140,
    cell: ({
      row: {
        original: { db = 0, id },
      },
    }) => (
      <InputContainer role="presentation">
        <InputFieldSentinel
          min={0}
          value={`${db}` || '0'}
          name={`db-${id}`}
          placeholder="Enter Index"
          inputType={SentinelInputFieldType.Number}
          onChangedInput={handleChangedInput}
        />
      </InputContainer>
    ),
  }
}
