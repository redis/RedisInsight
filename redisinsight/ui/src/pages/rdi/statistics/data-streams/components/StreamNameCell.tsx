import React from 'react'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { DataStreamsData } from 'uiSrc/pages/rdi/statistics/data-streams/DataStreams.types'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'

export const StreamNameCell = ({
  getValue,
}: CellContext<DataStreamsData, unknown>) => (
  <RiTooltip content={getValue<string>()}>
    <span>{formatLongName(getValue<string>(), 30, 0, '...')}</span>
  </RiTooltip>
)
