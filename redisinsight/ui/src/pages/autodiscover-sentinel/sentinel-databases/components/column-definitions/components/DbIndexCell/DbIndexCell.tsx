import React from 'react'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { RiIcon } from 'uiSrc/components/base/icons'

import type { DbIndexCellProps } from './DbIndexCell.types'

export const DbIndexCell = ({
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
