import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'

import type { PrimaryGroupCellProps } from './PrimaryGroupCell.types'

export const PrimaryGroupCell = ({ name }: PrimaryGroupCellProps) => (
  <CellText data-testid={`primary-group_${name}`}>{name}</CellText>
)
