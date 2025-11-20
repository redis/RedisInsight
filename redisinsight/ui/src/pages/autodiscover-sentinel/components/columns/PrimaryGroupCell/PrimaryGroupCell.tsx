import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { type CellContext } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import type { PrimaryGroupCellRendererProps } from './PrimaryGroupCell.types'

export const PrimaryGroupRenderer = ({
  name,
}: PrimaryGroupCellRendererProps) => (
  <CellText data-testid={`primary-group_${name}`}>{name}</CellText>
)

export const PrimaryGroupCell = (
  props: CellContext<ModifiedSentinelMaster, unknown>,
) => {
  const { name } = props.row.original
  return <PrimaryGroupRenderer name={name} />
}
