import React from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

import {
  ACTIONS_COLUMN_SIZE,
  INDEX_COLUMN_SIZE,
  SELECTION_COLUMN_WIDTH_REM,
  VALUE_COLUMN_SIZE,
} from '../../array-details-table/constants'

// Mirror the parent table's columns (selection + index + value + actions
// spacers) so expanded rows line up under them at any width. `* 10` scales the
// rem selection width to the px columns' scale (app's 62.5% root).
const SELECTION_COLUMN_FR = SELECTION_COLUMN_WIDTH_REM * 10

export const Band = styled(Col)`
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space050} 0;
`

export const BandRow = styled.div<
  React.HTMLAttributes<HTMLDivElement> & { $match?: boolean }
>`
  display: grid;
  grid-template-columns:
    minmax(0, ${SELECTION_COLUMN_FR}fr)
    minmax(0, ${INDEX_COLUMN_SIZE}fr)
    minmax(0, ${VALUE_COLUMN_SIZE}fr)
    minmax(0, ${ACTIONS_COLUMN_SIZE}fr);
  /* Center cells vertically so a short index stays aligned with a value that
     wraps to multiple lines. */
  align-items: center;
  background: ${({ theme, $match }) =>
    $match ? theme.semantic.color.background.neutral200 : 'transparent'};
`

// Match the parent body cell's padding and overflow so content lines up under —
// and clips like — the parent columns.
export const BandCell = styled.div`
  min-width: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.core.space.space050}
    ${({ theme }) => theme.core.space.space150};
`

export const Message = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space100};
  padding-left: calc(
    ${SELECTION_COLUMN_WIDTH_REM}rem +
      ${({ theme }) => theme.core.space.space150}
  );
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
`
